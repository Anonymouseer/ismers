<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Models\ClientAccount;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    /**
     * Check if the authenticated actor is a Client Portal account.
     */
    private function isClientUser($actor): bool
    {
        return $actor instanceof ClientAccount;
    }

    /**
     * Format a ChatThread model with client and AM metadata.
     */
    private function formatThread(ChatThread $thread): array
    {
        $client = $thread->clientAccount;
        $am = $thread->assignedUser;

        return [
            'id'                 => $thread->id,
            'clientAccountId'    => $thread->client_account_id,
            'company'            => $client?->company ?? 'Unknown Company',
            'companyId'          => $client?->company_id ?? ('CLT-2026-' . str_pad((string)($client?->id ?? 0), 4, '0', STR_PAD_LEFT)),
            'contactPerson'      => $client?->contact_person ?? 'Account Contact',
            'industry'           => $client?->industry ?? 'Corporate Client',
            'clientEmail'        => $client?->email,
            'clientMobile'       => $client?->mobile,
            'accountManager'     => $client?->am ?? ($am?->name ?? 'Karla Reyes (Lead AM)'),
            'subject'            => $thread->subject,
            'status'             => $thread->status,
            'lastMessageAt'      => $thread->last_message_at?->toISOString() ?? $thread->updated_at?->toISOString(),
            'lastMessagePreview' => $thread->last_message_preview ?? 'No messages yet.',
            'unreadClientCount'  => (int) $thread->unread_client_count,
            'unreadHrCount'      => (int) $thread->unread_hr_count,
            'createdAt'          => $thread->created_at?->toISOString(),
        ];
    }

    /**
     * Format a ChatMessage model for API response.
     */
    private function formatMessage(ChatMessage $msg): array
    {
        return [
            'id'         => $msg->id,
            'threadId'   => $msg->thread_id,
            'senderType' => $msg->sender_type,
            'senderId'   => $msg->sender_id,
            'senderName' => $msg->sender_name,
            'senderRole' => $msg->sender_role,
            'message'    => $msg->message,
            'isRead'     => (bool) $msg->is_read,
            'readAt'     => $msg->read_at?->toISOString(),
            'createdAt'  => $msg->created_at?->toISOString(),
        ];
    }

    /**
     * GET /api/v1/chat/threads
     * Retrieve conversations for the authenticated user/client.
     */
    public function index(Request $request): JsonResponse
    {
        $actor = $request->user();

        if ($this->isClientUser($actor)) {
            // Client Portal user: Find or create their dedicated communication thread
            $thread = ChatThread::firstOrCreate(
                ['client_account_id' => $actor->id],
                [
                    'subject'             => 'Corporate Staffing & Recruitment Support',
                    'status'              => 'open',
                    'last_message_at'     => now(),
                    'last_message_preview'=> 'Direct operational communication channel initialized.',
                ]
            );

            return response()->json([
                'threads' => [$this->formatThread($thread)],
            ]);
        }

        // HR Admin / Staff user: List all client threads
        $query = ChatThread::with(['clientAccount', 'assignedUser'])
            ->orderByRaw('last_message_at DESC NULLS LAST');

        if ($request->filled('q')) {
            $term = strtolower(trim($request->q));
            $query->whereHas('clientAccount', function ($q) use ($term) {
                $q->whereRaw('LOWER(company) LIKE ?', ["%{$term}%"])
                  ->orWhereRaw('LOWER(contact_person) LIKE ?', ["%{$term}%"])
                  ->orWhereRaw('LOWER(company_id) LIKE ?', ["%{$term}%"]);
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $threads = $query->get()->map(fn ($t) => $this->formatThread($t));

        return response()->json([
            'threads' => $threads,
        ]);
    }

    /**
     * POST /api/v1/chat/threads/by-client/{clientId}
     * Find or initiate a chat thread with a specific client (used by HR Admin).
     */
    public function findOrCreateForClient(Request $request, string $clientId): JsonResponse
    {
        $actor = $request->user();

        $client = ClientAccount::where('id', $clientId)
            ->orWhere('company_id', $clientId)
            ->first();

        if (!$client) {
            return response()->json(['message' => 'Target client account not found.'], 404);
        }

        // If client portal actor, enforce tenant isolation
        if ($this->isClientUser($actor) && $actor->id !== $client->id) {
            return response()->json(['message' => 'Unauthorized access to external client thread.'], 403);
        }

        $thread = ChatThread::firstOrCreate(
            ['client_account_id' => $client->id],
            [
                'subject'              => 'Corporate Staffing & Recruitment Support',
                'status'               => 'open',
                'last_message_at'      => now(),
                'last_message_preview' => 'Direct operational communication channel initialized.',
            ]
        );

        return response()->json($this->formatThread($thread));
    }

    /**
     * GET /api/v1/chat/threads/{id}/messages
     * Fetch chronological messages and clear unread count for the viewer.
     */
    public function messages(Request $request, int $id): JsonResponse
    {
        $actor = $request->user();
        $thread = ChatThread::with('clientAccount')->find($id);

        if (!$thread) {
            return response()->json(['message' => 'Chat thread not found.'], 404);
        }

        // Enforce RBAC: Client can only view their own thread
        if ($this->isClientUser($actor) && $thread->client_account_id !== $actor->id) {
            return response()->json(['message' => 'Unauthorized access to client thread.'], 403);
        }

        // Fetch chronological messages
        $messages = ChatMessage::where('thread_id', $thread->id)
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark incoming messages as read for current viewer
        if ($this->isClientUser($actor)) {
            ChatMessage::where('thread_id', $thread->id)
                ->where('sender_type', 'user')
                ->where('is_read', false)
                ->update(['is_read' => true, 'read_at' => now()]);

            if ($thread->unread_client_count > 0) {
                $thread->update(['unread_client_count' => 0]);
            }
        } else {
            ChatMessage::where('thread_id', $thread->id)
                ->where('sender_type', 'client_account')
                ->where('is_read', false)
                ->update(['is_read' => true, 'read_at' => now()]);

            if ($thread->unread_hr_count > 0) {
                $thread->update(['unread_hr_count' => 0]);
            }
        }

        return response()->json([
            'thread'   => $this->formatThread($thread),
            'messages' => $messages->map(fn ($m) => $this->formatMessage($m)),
        ]);
    }

    /**
     * POST /api/v1/chat/threads/{id}/messages
     * Transmit a message to the thread with strict XSS sanitization and audit logging.
     */
    public function sendMessage(Request $request, int $id): JsonResponse
    {
        $actor = $request->user();
        $thread = ChatThread::with('clientAccount')->find($id);

        if (!$thread) {
            return response()->json(['message' => 'Chat thread not found.'], 404);
        }

        // Enforce tenant boundary
        if ($this->isClientUser($actor) && $thread->client_account_id !== $actor->id) {
            return response()->json(['message' => 'Unauthorized to send message on this thread.'], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string|min:1|max:3000',
        ]);

        // Defensive server-side sanitization against XSS
        $sanitized = trim(strip_tags($validated['message']));
        if (empty($sanitized)) {
            return response()->json(['message' => 'Message cannot be empty.'], 422);
        }

        if ($this->isClientUser($actor)) {
            $senderType = 'client_account';
            $senderId   = $actor->id;
            $senderName = $actor->contact_person
                ? "{$actor->contact_person} ({$actor->company})"
                : $actor->company;
            $senderRole = 'Client Representative';

            // Increment HR unread count
            $thread->increment('unread_hr_count');
        } else {
            $senderType = 'user';
            $senderId   = $actor->id;
            $senderName = $actor->name ?? 'HR Administrator';
            $senderRole = $actor->role_label ?: 'PRIMEPOWER HR Operations';

            // Increment Client unread count
            $thread->increment('unread_client_count');
        }

        $message = ChatMessage::create([
            'thread_id'   => $thread->id,
            'sender_type' => $senderType,
            'sender_id'   => $senderId,
            'sender_name' => $senderName,
            'sender_role' => $senderRole,
            'message'     => $sanitized,
            'is_read'     => false,
        ]);

        $thread->update([
            'last_message_at'      => now(),
            'last_message_preview' => Str::limit($sanitized, 120),
            'status'               => 'open',
        ]);

        // Log transaction in audit trail
        ActivityLog::record(
            action: "Dispatched operational message in thread #{$thread->id} for {$thread->clientAccount?->company}",
            module: 'Communications',
            details: [
                'thread_id'   => $thread->id,
                'sender_type' => $senderType,
                'client'      => $thread->clientAccount?->company,
            ],
            request: $request
        );

        return response()->json([
            'message' => $this->formatMessage($message),
            'thread'  => $this->formatThread($thread->fresh()),
        ], 201);
    }

    /**
     * PATCH /api/v1/chat/threads/{id}/read
     * Explicitly acknowledge and mark all messages as read.
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $actor = $request->user();
        $thread = ChatThread::find($id);

        if (!$thread) {
            return response()->json(['message' => 'Chat thread not found.'], 404);
        }

        if ($this->isClientUser($actor)) {
            if ($thread->client_account_id !== $actor->id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
            ChatMessage::where('thread_id', $thread->id)
                ->where('sender_type', 'user')
                ->where('is_read', false)
                ->update(['is_read' => true, 'read_at' => now()]);
            $thread->update(['unread_client_count' => 0]);
        } else {
            ChatMessage::where('thread_id', $thread->id)
                ->where('sender_type', 'client_account')
                ->where('is_read', false)
                ->update(['is_read' => true, 'read_at' => now()]);
            $thread->update(['unread_hr_count' => 0]);
        }

        return response()->json(['success' => true]);
    }

    /**
     * GET /api/v1/chat/unread-count
     * Fast counter endpoint for navigation badges.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $actor = $request->user();

        if ($this->isClientUser($actor)) {
            $count = (int) ChatThread::where('client_account_id', $actor->id)
                ->sum('unread_client_count');
        } else {
            $count = (int) ChatThread::sum('unread_hr_count');
        }

        return response()->json(['unreadCount' => $count]);
    }
}
