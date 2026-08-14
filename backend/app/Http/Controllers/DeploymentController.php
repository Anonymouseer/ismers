<?php

namespace App\Http\Controllers;

use App\Models\Applicant;
use App\Models\Deployment;
use App\Models\JobOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeploymentController extends Controller
{
    /**
     * Default mock deployments to auto-seed if table is empty.
     */
    private const SEED_DEPLOYMENTS = [
        [
            'deployment_ref' => 'DEP-001',
            'employee_name' => 'Andrea Molina',
            'client_name' => 'Seda Vertis North',
            'job_order_ref' => 'JO-015',
            'position_title' => 'Front Desk Associate',
            'site_facility' => 'Vertis North, Astra cor. Lux Drive, QC',
            'site_supervisor' => 'Cecille Lim (Hotel GM)',
            'site_supervisor_contact' => '+63 917 555 0192',
            'shift_schedule' => 'Morning Shift (06:00 - 15:00)',
            'start_date' => 'Jul 03, 2026',
            'end_date' => 'Oct 03, 2026',
            'stage' => 'on_site',
            'compliance_checklist' => [
                'medicalClearance' => true,
                'nbiClearance' => true,
                'govtIds' => true,
                'signedContract' => true,
                'ppeIssued' => true,
                'clientOrientation' => true,
            ],
            'pre_employment_snapshot' => [
                'medicalClinic' => 'HealthHub Diagnostics QC',
                'fitToWork' => 'Class A - Fit for Duty',
                'drugTestResult' => 'Negative (10-Panel)',
                'sss' => '34-8901234-5',
                'philhealth' => '12-050678901-2',
                'pagibig' => '1210-9876-5432',
                'tin' => '345-678-901-000',
                'contractSignedDate' => 'Jul 02, 2026',
                'ppeGear' => 'Uniform Shirt (M), ID Badge, Safety Shoes (38)',
                'bankEndorsement' => 'BDO Payroll Endorsement Ref #BDO-2026-089',
            ],
            'history' => [
                ['date' => 'Jul 01, 2026', 'event' => 'Candidate Assigned', 'note' => 'Hired via Recruitment & Selection for JO-015.'],
                ['date' => 'Jul 02, 2026', 'event' => 'Pre-Deployment Cleared', 'note' => 'All 6/6 mandatory compliance requirements verified.'],
                ['date' => 'Jul 03, 2026', 'event' => 'Dispatched & Confirmed On-Site', 'note' => 'Reported to Hotel GM Cecille Lim; active deployment started.'],
            ],
        ],
        [
            'deployment_ref' => 'DEP-002',
            'employee_name' => 'Jomar Villagracia',
            'client_name' => 'ABC Logistics',
            'job_order_ref' => 'JO-001',
            'position_title' => 'Warehouse Associate',
            'site_facility' => 'Valenzuela Logistics Hub, NCR',
            'site_supervisor' => 'Mario Santos (Operations Mgr)',
            'site_supervisor_contact' => '+63 918 444 7890',
            'shift_schedule' => 'Night Shift (22:00 - 07:00)',
            'start_date' => 'Jul 03, 2026',
            'end_date' => 'Jan 03, 2027',
            'stage' => 'on_site',
            'compliance_checklist' => [
                'medicalClearance' => true,
                'nbiClearance' => true,
                'govtIds' => true,
                'signedContract' => true,
                'ppeIssued' => true,
                'clientOrientation' => true,
            ],
            'pre_employment_snapshot' => [
                'medicalClinic' => 'Hi-Precision Diagnostics Valenzuela',
                'fitToWork' => 'Class A - Heavy Duty Cleared',
                'drugTestResult' => 'Negative (10-Panel)',
                'sss' => '09-1234567-8',
                'philhealth' => '04-123456789-0',
                'pagibig' => '1210-4455-6677',
                'tin' => '234-567-890-000',
                'contractSignedDate' => 'Jul 02, 2026',
                'ppeGear' => 'High-Vis Vest, Steel Toe Shoes (43), Hard Hat',
                'bankEndorsement' => 'BPI Payroll Endorsement Ref #BPI-2026-112',
            ],
            'history' => [
                ['date' => 'Jul 01, 2026', 'event' => 'Assigned', 'note' => 'Selected for ABC Logistics warehouse operations.'],
                ['date' => 'Jul 03, 2026', 'event' => 'On-Site Deployment', 'note' => 'Night shift staging and inventory handler.'],
            ],
        ],
        [
            'deployment_ref' => 'DEP-003',
            'employee_name' => 'Danilo Ferrer',
            'client_name' => 'ABC Logistics',
            'job_order_ref' => 'JO-002',
            'position_title' => 'Forklift Operator',
            'site_facility' => 'Valenzuela Logistics Hub, NCR',
            'site_supervisor' => 'Mario Santos (Operations Mgr)',
            'site_supervisor_contact' => '+63 918 444 7890',
            'shift_schedule' => 'Day Shift (08:00 - 17:00)',
            'start_date' => 'Jul 05, 2026',
            'end_date' => 'Oct 05, 2026',
            'stage' => 'on_site',
            'compliance_checklist' => [
                'medicalClearance' => true,
                'nbiClearance' => true,
                'govtIds' => true,
                'signedContract' => true,
                'ppeIssued' => true,
                'clientOrientation' => true,
            ],
            'pre_employment_snapshot' => [
                'medicalClinic' => 'HealthHub Diagnostics QC',
                'fitToWork' => 'Class A - Heavy Equipment Cleared',
                'drugTestResult' => 'Negative (10-Panel)',
                'sss' => '03-9876543-2',
                'philhealth' => '08-765432109-8',
                'pagibig' => '1210-9988-7766',
                'tin' => '123-456-789-000',
                'contractSignedDate' => 'Jul 04, 2026',
                'ppeGear' => 'High-Vis Vest, Safety Shoes (42), Gloves, Ear Protection',
                'bankEndorsement' => 'BDO Payroll Endorsement Ref #BDO-2026-104',
            ],
            'history' => [
                ['date' => 'Jul 04, 2026', 'event' => 'TESDA Heavy Equipment Verified', 'note' => 'NC II Certificate verified.'],
                ['date' => 'Jul 05, 2026', 'event' => 'On-Site Deployment', 'note' => 'Active forklift operations.'],
            ],
        ],
        [
            'deployment_ref' => 'DEP-004',
            'employee_name' => 'Patricia Gomez',
            'client_name' => 'Vikings Luxury Buffet',
            'job_order_ref' => 'JO-003',
            'position_title' => 'Kitchen Staff / Food Prep',
            'site_facility' => 'SM Mall of Asia, Seaside Blvd, Pasay City',
            'site_supervisor' => 'Marco Santos (Executive Chef)',
            'site_supervisor_contact' => '+63 917 222 3456',
            'shift_schedule' => 'Mid Shift (11:00 - 20:00)',
            'start_date' => 'Jul 10, 2026',
            'end_date' => 'Oct 10, 2026',
            'stage' => 'on_site',
            'compliance_checklist' => [
                'medicalClearance' => true,
                'nbiClearance' => true,
                'govtIds' => true,
                'signedContract' => true,
                'ppeIssued' => true,
                'clientOrientation' => true,
            ],
            'pre_employment_snapshot' => [
                'medicalClinic' => 'St. Martin Clinic Pasay',
                'fitToWork' => 'Food Handler Clearance & Fit to Work',
                'drugTestResult' => 'Negative (10-Panel)',
                'sss' => '04-5566778-9',
                'philhealth' => '11-334455667-8',
                'pagibig' => '1210-3322-1100',
                'tin' => '456-789-012-000',
                'contractSignedDate' => 'Jul 09, 2026',
                'ppeGear' => 'Chef Apron, Hair Net, Non-Slip Kitchen Shoes (37)',
                'bankEndorsement' => 'UnionBank Payroll Ref #UB-2026-045',
            ],
            'history' => [
                ['date' => 'Jul 09, 2026', 'event' => 'Sanitation Clearance Verified', 'note' => 'Food handler medical certificate cleared.'],
                ['date' => 'Jul 10, 2026', 'event' => 'Active Deployment', 'note' => 'Kitchen prep and dining support.'],
            ],
        ],
        [
            'deployment_ref' => 'DEP-005',
            'employee_name' => 'Joyce Manalastas',
            'client_name' => 'City Garden Hotel',
            'job_order_ref' => 'JO-004',
            'position_title' => 'Housekeeping Attendant',
            'site_facility' => 'P. Burgos cor. Makati Ave, Makati City',
            'site_supervisor' => 'Dennis Ocampo (Hotel Manager)',
            'site_supervisor_contact' => '+63 919 888 1234',
            'shift_schedule' => 'Regular Shift (07:00 - 16:00)',
            'start_date' => 'Jul 26, 2026',
            'end_date' => 'Jan 26, 2027',
            'stage' => 'dispatched',
            'compliance_checklist' => [
                'medicalClearance' => true,
                'nbiClearance' => true,
                'govtIds' => true,
                'signedContract' => true,
                'ppeIssued' => true,
                'clientOrientation' => true,
            ],
            'pre_employment_snapshot' => [
                'medicalClinic' => 'Makati Medical Center OPD',
                'fitToWork' => 'Class A - Fit for Duty',
                'drugTestResult' => 'Negative (10-Panel)',
                'sss' => '07-3344112-3',
                'philhealth' => '09-223344556-7',
                'pagibig' => '1210-5544-3322',
                'tin' => '567-890-123-000',
                'contractSignedDate' => 'Jul 22, 2026',
                'ppeGear' => 'Housekeeping Uniform, Rubber Gloves, Service Shoes (38)',
                'bankEndorsement' => 'BDO Payroll Endorsement Ref #BDO-2026-198',
            ],
            'history' => [
                ['date' => 'Jul 22, 2026', 'event' => 'Pre-Deployment Cleared', 'note' => 'All items 6/6 verified.'],
                ['date' => 'Jul 24, 2026', 'event' => 'Deployment Pass Issued', 'note' => 'Dispatched to City Garden Hotel Makati.'],
            ],
        ],
        [
            'deployment_ref' => 'DEP-006',
            'employee_name' => 'Nikki Fernandez',
            'client_name' => 'Seda Vertis North',
            'job_order_ref' => 'JO-015',
            'position_title' => 'Front Desk Associate',
            'site_facility' => 'Vertis North, Astra cor. Lux Drive, QC',
            'site_supervisor' => 'Cecille Lim (Hotel GM)',
            'site_supervisor_contact' => '+63 917 555 0192',
            'shift_schedule' => 'Rotating Shift',
            'start_date' => 'Jul 28, 2026',
            'end_date' => 'Oct 28, 2026',
            'stage' => 'pre_deployment',
            'compliance_checklist' => [
                'medicalClearance' => true,
                'nbiClearance' => true,
                'govtIds' => true,
                'signedContract' => true,
                'ppeIssued' => false,
                'clientOrientation' => false,
            ],
            'pre_employment_snapshot' => [
                'medicalClinic' => 'HealthHub Diagnostics QC',
                'fitToWork' => 'Class A - Fit for Duty',
                'drugTestResult' => 'Negative (10-Panel)',
                'sss' => '05-9988776-5',
                'philhealth' => '10-998877665-4',
                'pagibig' => '1210-7788-9900',
                'tin' => '678-901-234-000',
                'contractSignedDate' => 'Jul 24, 2026',
                'ppeGear' => 'Uniform Blazer (Pending Size S fitting)',
                'bankEndorsement' => 'BDO Payroll Endorsement Ref #BDO-2026-211',
            ],
            'history' => [
                ['date' => 'Jul 23, 2026', 'event' => 'Assigned', 'note' => 'Selected for Front Desk position.'],
                ['date' => 'Jul 24, 2026', 'event' => 'Compliance Verification', 'note' => 'PPE issuance and orientation pending.'],
            ],
        ],
        [
            'deployment_ref' => 'DEP-007',
            'employee_name' => 'Ben Alvarez',
            'client_name' => 'Vikings Luxury Buffet',
            'job_order_ref' => 'JO-003',
            'position_title' => 'Dining Service Associate',
            'site_facility' => 'SM Mall of Asia, Seaside Blvd, Pasay City',
            'site_supervisor' => 'Marco Santos (Executive Chef)',
            'site_supervisor_contact' => '+63 917 222 3456',
            'shift_schedule' => 'Evening Shift (15:00 - 00:00)',
            'start_date' => 'Jul 30, 2026',
            'end_date' => 'Jul 30, 2027',
            'stage' => 'assigned',
            'compliance_checklist' => [
                'medicalClearance' => false,
                'nbiClearance' => true,
                'govtIds' => true,
                'signedContract' => false,
                'ppeIssued' => false,
                'clientOrientation' => false,
            ],
            'pre_employment_snapshot' => [
                'medicalClinic' => 'Pending Clinic Appointment',
                'fitToWork' => 'Pending Medical Result',
                'drugTestResult' => 'Pending Drug Test',
                'sss' => '02-1122334-4',
                'philhealth' => '03-556677889-0',
                'pagibig' => '1210-1122-3344',
                'tin' => '789-012-345-000',
                'contractSignedDate' => 'Pending Execution',
                'ppeGear' => 'Not yet issued',
                'bankEndorsement' => 'Pending Account Opening',
            ],
            'history' => [
                ['date' => 'Jul 24, 2026', 'event' => 'Assigned from Pool', 'note' => 'Pending pre-employment medical and fit-to-work clearance.'],
            ],
        ],
        [
            'deployment_ref' => 'DEP-008',
            'employee_name' => 'Rodel Panganiban',
            'client_name' => 'Y2 Hotel Residence',
            'job_order_ref' => 'JO-007',
            'position_title' => 'Maintenance Technician',
            'site_facility' => 'Santiago cor. Valdez St, Makati City',
            'site_supervisor' => 'Gina Alcantara (Head of Operations)',
            'site_supervisor_contact' => '+63 922 555 9012',
            'shift_schedule' => 'Morning Shift (06:00 - 15:00)',
            'start_date' => 'Jun 22, 2026',
            'end_date' => 'Jul 22, 2026',
            'stage' => 'completed',
            'compliance_checklist' => [
                'medicalClearance' => true,
                'nbiClearance' => true,
                'govtIds' => true,
                'signedContract' => true,
                'ppeIssued' => true,
                'clientOrientation' => true,
            ],
            'pre_employment_snapshot' => [
                'medicalClinic' => 'Makati Medical Center OPD',
                'fitToWork' => 'Class A - Maintenance & Technical Fit',
                'drugTestResult' => 'Negative (10-Panel)',
                'sss' => '01-4455667-8',
                'philhealth' => '06-990011223-4',
                'pagibig' => '1210-6677-8899',
                'tin' => '890-123-456-000',
                'contractSignedDate' => 'Jun 20, 2026',
                'ppeGear' => 'Safety Boots (44), Tool Vest, Hard Hat, Insulated Gloves',
                'bankEndorsement' => 'BDO Payroll Endorsement Ref #BDO-2026-077',
            ],
            'history' => [
                ['date' => 'Jun 22, 2026', 'event' => 'Deployed On-Site', 'note' => 'Maintenance contract started.'],
                ['date' => 'Jul 22, 2026', 'event' => 'Deployment Concluded', 'note' => 'Completed 1-month deployment period smoothly.'],
            ],
        ],
    ];

    /**
     * Auto-seed default deployments if table is empty.
     */
    private function ensureSeeded(): void
    {
        if (Deployment::count() === 0) {
            foreach (self::SEED_DEPLOYMENTS as $seed) {
                Deployment::create($seed);
            }
        }
    }

    /**
     * Format a Deployment model into the shape expected by frontend.
     */
    private function formatDeployment(Deployment $d): array
    {
        $applicant = $d->applicant;
        $snapshot = $d->pre_employment_snapshot ?? [];

        // If linked to a live applicant in DB, pull their latest live pre-employment details
        if ($applicant) {
            $med = $applicant->medical_referral ?? [];
            $stat = $applicant->statutory_numbers ?? [];
            $contract = $applicant->employment_contract ?? [];
            $ppe = $applicant->ppe_issuance ?? [];
            $atm = $applicant->atm_endorsement ?? [];

            $snapshot = array_merge($snapshot, [
                'medicalClinic' => $med['clinic'] ?? ($snapshot['medicalClinic'] ?? 'HealthHub Diagnostics'),
                'fitToWork' => $med['fitToWork'] ?? ($snapshot['fitToWork'] ?? 'Class A - Fit for Duty'),
                'drugTestResult' => $med['drugTest'] ?? ($snapshot['drugTestResult'] ?? 'Negative (10-Panel)'),
                'sss' => $stat['sss'] ?? ($snapshot['sss'] ?? '—'),
                'philhealth' => $stat['philhealth'] ?? ($snapshot['philhealth'] ?? '—'),
                'pagibig' => $stat['pagibig'] ?? ($snapshot['pagibig'] ?? '—'),
                'tin' => $stat['tin'] ?? ($snapshot['tin'] ?? '—'),
                'contractSignedDate' => $contract['signedDate'] ?? ($snapshot['contractSignedDate'] ?? $d->start_date),
                'ppeGear' => !empty($ppe) ? "Shirt: {$ppe['shirtSize']}, Shoes: {$ppe['shoeSize']}" : ($snapshot['ppeGear'] ?? 'Standard Safety Gear'),
                'bankEndorsement' => $atm['reference'] ?? ($snapshot['bankEndorsement'] ?? 'BDO Payroll Endorsement'),
            ]);
        }

        return [
            'id' => $d->deployment_ref,
            'dbId' => $d->id,
            'applicantId' => $d->applicant_id,
            'employee' => $d->employee_name,
            'client' => $d->client_name,
            'jobOrderRef' => $d->job_order_ref,
            'position' => $d->position_title,
            'site' => $d->site_facility,
            'supervisor' => $d->site_supervisor ?? 'Operations Supervisor',
            'supervisorContact' => $d->site_supervisor_contact ?? '+63 900 000 0000',
            'shift' => $d->shift_schedule ?? 'Regular Day Shift (08:00 - 17:00)',
            'start' => $d->start_date,
            'end' => $d->end_date,
            'stage' => $d->stage,
            'compliance' => $d->compliance_checklist ?? [
                'medicalClearance' => false,
                'nbiClearance' => false,
                'govtIds' => false,
                'signedContract' => false,
                'ppeIssued' => false,
                'clientOrientation' => false,
            ],
            'preEmployment' => $snapshot,
            'history' => $d->history ?? [],
            'createdAt' => $d->created_at ? $d->created_at->format('M d, Y') : '—',
        ];
    }

    /**
     * GET /api/v1/deployments
     */
    public function index(): JsonResponse
    {
        $this->ensureSeeded();

        $deployments = Deployment::with('applicant')
            ->orderBy('id', 'asc')
            ->get()
            ->map(fn ($d) => $this->formatDeployment($d));

        return response()->json($deployments);
    }

    /**
     * GET /api/v1/deployments/pending-hires
     * Pulls applicants from Recruitment & Selection who are in 'for_deployment' or 'hired'.
     */
    public function pendingHires(): JsonResponse
    {
        $applicants = Applicant::where(function ($q) {
            $q->where('recruitment_stage', 'for_deployment')
              ->orWhere('recruitment_stage', 'contract_signing')
              ->orWhere('status', 'hired');
        })
        ->with('jobOrder')
        ->get()
        ->map(function ($a) {
            $fullName = trim("{$a->first_name} {$a->last_name}");
            $job = $a->jobOrder;

            return [
                'applicantId' => $a->id,
                'regId' => $a->reg_id,
                'name' => $fullName,
                'jobTitle' => $job?->title ?? $a->category ?? 'Staff Role',
                'client' => $job?->client ?? 'ABC Logistics',
                'jobOrderRef' => $job?->ref ?? 'JO-001',
                'site' => $job?->location ?? 'NCR Facility',
                'supervisor' => 'Operations Supervisor',
                'medical' => $a->medical_referral,
                'statutory' => $a->statutory_numbers,
                'contract' => $a->employment_contract,
                'ppe' => $a->ppe_issuance,
                'atm' => $a->atm_endorsement,
            ];
        });

        return response()->json($applicants);
    }

    /**
     * POST /api/v1/deployments
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'employee' => 'required|string',
            'client' => 'required|string',
            'jobOrderRef' => 'nullable|string',
            'position' => 'required|string',
            'site' => 'required|string',
            'start' => 'required|string',
            'end' => 'required|string',
        ]);

        $maxId = Deployment::max('id') ?? 0;
        $nextNum = $maxId + 1;
        $depRef = 'DEP-' . str_pad($nextNum, 3, '0', STR_PAD_LEFT);

        $applicant = null;
        if ($request->filled('applicantId')) {
            $applicant = Applicant::find($request->applicantId);
        }

        $snapshot = [];
        if ($applicant) {
            $med = $applicant->medical_referral ?? [];
            $stat = $applicant->statutory_numbers ?? [];
            $contract = $applicant->employment_contract ?? [];
            $ppe = $applicant->ppe_issuance ?? [];
            $atm = $applicant->atm_endorsement ?? [];

            $snapshot = [
                'medicalClinic' => $med['clinic'] ?? 'HealthHub Diagnostics',
                'fitToWork' => $med['fitToWork'] ?? 'Class A - Fit for Duty',
                'drugTestResult' => $med['drugTest'] ?? 'Negative (10-Panel)',
                'sss' => $stat['sss'] ?? '—',
                'philhealth' => $stat['philhealth'] ?? '—',
                'pagibig' => $stat['pagibig'] ?? '—',
                'tin' => $stat['tin'] ?? '—',
                'contractSignedDate' => $contract['signedDate'] ?? $request->start,
                'ppeGear' => !empty($ppe) ? "Shirt: {$ppe['shirtSize']}, Shoes: {$ppe['shoeSize']}" : 'Standard Safety Gear',
                'bankEndorsement' => $atm['reference'] ?? 'BDO Payroll Endorsement',
            ];

            // Update applicant deployment info in DB
            $applicant->update([
                'recruitment_stage' => 'for_deployment',
                'deployment_details' => [
                    'deploymentRef' => $depRef,
                    'client' => $request->client,
                    'site' => $request->site,
                    'startDate' => $request->start,
                    'endDate' => $request->end,
                    'position' => $request->position,
                ],
            ]);
        }

        $today = now()->format('M d, Y');
        $deployment = Deployment::create([
            'deployment_ref' => $depRef,
            'applicant_id' => $applicant?->id,
            'job_order_ref' => $request->jobOrderRef ?? 'JO-001',
            'employee_name' => trim($request->employee),
            'client_name' => $request->client,
            'position_title' => $request->position,
            'site_facility' => $request->site,
            'site_supervisor' => $request->supervisor ?? 'Operations Supervisor',
            'site_supervisor_contact' => $request->supervisorContact ?? '+63 900 000 0000',
            'shift_schedule' => $request->shift ?? 'Regular Day Shift (08:00 - 17:00)',
            'start_date' => $request->start,
            'end_date' => $request->end,
            'stage' => 'assigned',
            'compliance_checklist' => [
                'medicalClearance' => !empty($snapshot['medicalClinic']),
                'nbiClearance' => true,
                'govtIds' => !empty($snapshot['sss']),
                'signedContract' => !empty($snapshot['contractSignedDate']),
                'ppeIssued' => !empty($snapshot['ppeGear']),
                'clientOrientation' => false,
            ],
            'pre_employment_snapshot' => $snapshot,
            'history' => [
                ['date' => $today, 'event' => 'Deployment Created', 'note' => "Candidate assigned to {$request->client} ({$request->jobOrderRef})."],
            ],
        ]);

        return response()->json($this->formatDeployment($deployment), 201);
    }

    /**
     * GET /api/v1/deployments/{id}
     */
    public function show(string $id): JsonResponse
    {
        $d = Deployment::where('deployment_ref', $id)
            ->orWhere('id', is_numeric($id) ? (int)$id : 0)
            ->with('applicant')
            ->firstOrFail();

        return response()->json($this->formatDeployment($d));
    }

    /**
     * PATCH /api/v1/deployments/{id}/stage
     */
    public function updateStage(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'stage' => 'required|string|in:assigned,pre_deployment,scheduled,dispatched,on_site,completed,closed',
        ]);

        $d = Deployment::where('deployment_ref', $id)
            ->orWhere('id', is_numeric($id) ? (int)$id : 0)
            ->firstOrFail();

        $stageLabels = [
            'assigned' => 'Candidate Assigned',
            'pre_deployment' => 'Pre-Deployment Verification Initiated',
            'scheduled' => 'Deployment Scheduled',
            'dispatched' => 'Dispatched with Deployment Slip',
            'on_site' => 'Confirmed Active On-Site by Client Supervisor',
            'completed' => 'Deployment Concluded',
            'closed' => 'Record Archived',
        ];

        $today = now()->format('M d, Y');
        $history = $d->history ?? [];
        $history[] = [
            'date' => $today,
            'event' => $stageLabels[$request->stage] ?? $request->stage,
            'note' => "Deployment advanced to " . ($stageLabels[$request->stage] ?? $request->stage) . ".",
        ];

        $d->update([
            'stage' => $request->stage,
            'history' => $history,
        ]);

        return response()->json($this->formatDeployment($d));
    }

    /**
     * PATCH /api/v1/deployments/{id}/compliance
     */
    public function updateCompliance(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'compliance' => 'nullable|array',
            'key' => 'nullable|string',
        ]);

        $d = Deployment::where('deployment_ref', $id)
            ->orWhere('id', is_numeric($id) ? (int)$id : 0)
            ->firstOrFail();

        $current = $d->compliance_checklist ?? [];

        if ($request->has('key')) {
            $k = $request->key;
            $current[$k] = !($current[$k] ?? false);
        } elseif ($request->has('compliance')) {
            $current = $request->compliance;
        }

        $d->update(['compliance_checklist' => $current]);

        return response()->json($this->formatDeployment($d));
    }
}
