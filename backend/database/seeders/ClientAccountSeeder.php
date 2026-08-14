<?php

namespace Database\Seeders;

use App\Models\ClientAccount;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ClientAccountSeeder extends Seeder
{
    public const CLIENT_DIRECTORY = [
        [
            'company_id' => 'CLT-2026-0001',
            'company' => 'ABC Logistics',
            'industry' => 'Warehousing & Logistics',
            'contact_person' => 'Ricardo M. Santos',
            'designation' => 'HR Manager',
            'email' => 'hr@abclogistics.com.ph',
            'mobile' => '+63 917 555 0101',
            'password' => 'BCL@2026',
        ],
        [
            'company_id' => 'CLT-2026-0002',
            'company' => 'Northline BPO',
            'industry' => 'Business Process Outsourcing',
            'contact_person' => 'Carmela R. Tan',
            'designation' => 'Talent Acquisition Lead',
            'email' => 'talent@northlinebpo.com.ph',
            'mobile' => '+63 918 555 0202',
            'password' => 'NRT@2026',
        ],
        [
            'company_id' => 'CLT-2026-0003',
            'company' => 'Delta Manufacturing',
            'industry' => 'Manufacturing',
            'contact_person' => 'Edwin G. Pascual',
            'designation' => 'Plant HR Officer',
            'email' => 'hr@deltamfg.com.ph',
            'mobile' => '+63 919 555 0303',
            'password' => 'DLT@2026',
        ],
        [
            'company_id' => 'CLT-2026-0004',
            'company' => 'Coastal Retail Group',
            'industry' => 'Retail',
            'contact_person' => 'Juanita M. Dela Cruz',
            'designation' => 'Human Resources Manager',
            'email' => 'hr@coastalretail.com.ph',
            'mobile' => '+63 917 555 0404',
            'password' => 'CST@2026',
        ],
        [
            'company_id' => 'CLT-2026-0005',
            'company' => 'Vantage Tech Solutions',
            'industry' => 'Information Technology',
            'contact_person' => 'Patrick L. Chua',
            'designation' => 'VP of Operations',
            'email' => 'ops@vantagetech.com.ph',
            'mobile' => '+63 920 555 0505',
            'password' => 'VNT@2026',
        ],
        [
            'company_id' => 'CLT-2026-0006',
            'company' => 'Everwell Health Group',
            'industry' => 'Healthcare',
            'contact_person' => 'Dr. Lilian A. Reyes',
            'designation' => 'Chief Medical Officer',
            'email' => 'admin@everwellhealth.com.ph',
            'mobile' => '+63 921 555 0606',
            'password' => 'VRW@2026',
        ],
        [
            'company_id' => 'CLT-2026-0007',
            'company' => 'Ironclad Freight Co.',
            'industry' => 'Freight & Transport',
            'contact_person' => 'Manuel B. Reyes',
            'designation' => 'Operations Manager',
            'email' => 'ops@ironcladfreight.com.ph',
            'mobile' => '+63 922 555 0707',
            'password' => 'RNC@2026',
        ],
        [
            'company_id' => 'CLT-2026-0008',
            'company' => 'Sunrise Hospitality Group',
            'industry' => 'Hospitality',
            'contact_person' => 'Maria Teresa C. Lopez',
            'designation' => 'HR Director',
            'email' => 'hr@sunrisehospitality.com.ph',
            'mobile' => '+63 923 555 0808',
            'password' => 'SNR@2026',
        ],
        [
            'company_id' => 'CLT-2026-0009',
            'company' => 'Prime Realty Corp',
            'industry' => 'Real Estate',
            'contact_person' => 'Atty. Ronaldo F. Bautista',
            'designation' => 'Head of Property Management',
            'email' => 'hr@primerealty.com.ph',
            'mobile' => '+63 924 555 0909',
            'password' => 'PRM@2026',
        ],
        [
            'company_id' => 'CLT-2026-0010',
            'company' => 'Metro Health Diagnostics',
            'industry' => 'Healthcare',
            'contact_person' => 'Dr. Sofia G. Mercado',
            'designation' => 'Branch Operations Head',
            'email' => 'hr@metrohealthdiag.com.ph',
            'mobile' => '+63 925 555 1010',
            'password' => 'MTR@2026',
        ],
        [
            'company_id' => 'CLT-2026-0011',
            'company' => 'GreenFields Agri Export',
            'industry' => 'Agriculture & Export',
            'contact_person' => 'Engr. Carlos P. Villanueva',
            'designation' => 'Plant Manager',
            'email' => 'operations@greenfieldsagri.com.ph',
            'mobile' => '+63 926 555 1111',
            'password' => 'GRN@2026',
        ],
        [
            'company_id' => 'CLT-2026-0012',
            'company' => 'Apex Construction Builders',
            'industry' => 'Construction',
            'contact_person' => 'Engr. Roberto S. Mendoza',
            'designation' => 'Project Director',
            'email' => 'hr@apexbuilders.com.ph',
            'mobile' => '+63 927 555 1212',
            'password' => 'PXC@2026',
        ],
        [
            'company_id' => 'CLT-2026-0013',
            'company' => 'Nordic Freight Co.',
            'industry' => 'Freight & Cargo',
            'contact_person' => 'Alfredo T. Navarro',
            'designation' => 'Fleet Operations Head',
            'email' => 'ops@nordicfreight.com.ph',
            'mobile' => '+63 928 555 1313',
            'password' => 'NRD@2026',
        ],
        [
            'company_id' => 'CLT-2026-0014',
            'company' => 'Coastline Retail Group',
            'industry' => 'Retail Staffing',
            'contact_person' => 'Jasmine D. Uy',
            'designation' => 'Former HR Head',
            'email' => 'hr@coastlineretail.com.ph',
            'mobile' => '+63 929 555 1414',
            'password' => 'CST@2026',
        ],
    ];

    public function run(): void
    {
        foreach (self::CLIENT_DIRECTORY as $clientData) {
            ClientAccount::updateOrCreate(
                ['email' => $clientData['email']],
                [
                    'company_id' => $clientData['company_id'] ?? null,
                    'company' => $clientData['company'],
                    'industry' => $clientData['industry'],
                    'contact_person' => $clientData['contact_person'],
                    'designation' => $clientData['designation'],
                    'mobile' => $clientData['mobile'],
                    'password' => Hash::make($clientData['password']),
                    'agreed' => true,
                ]
            );
        }
    }
}
