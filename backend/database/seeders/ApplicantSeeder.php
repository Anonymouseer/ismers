<?php

namespace Database\Seeders;

use App\Models\Applicant;
use Illuminate\Database\Seeder;

class ApplicantSeeder extends Seeder
{
    public function run(): void
    {
        $seedData = [
            [
                'reg_id' => 'REG-001', 'first_name' => 'Maricel', 'middle_name' => 'Santiago', 'last_name' => 'Andrade', 'suffix' => '',
                'email' => 'maricel.andrade@email.com', 'phone' => '0917-201-3345', 'alternate_contact' => '0917-201-9900',
                'city_address' => 'Valenzuela City', 'provincial_address' => '18 Mabini St.', 'date_of_birth' => '2002-03-14',
                'gender' => 'Female', 'civil_status' => 'Single', 'nationality' => 'Filipino',
                'experience_summary' => 'No formal work experience yet', 'stage' => 'registered', 'status' => 'active', 'submission_source' => 'staff',
                'skills' => ['Basic computer literacy'],
                'work_history' => [['role' => 'On-the-job Trainee', 'company' => 'Valenzuela City Hall', 'duration' => '2024 (OJT, 3 months)']],
                'education' => [['level' => 'Senior High School', 'school' => 'Valenzuela City NHS', 'degree' => 'General Academic Strand', 'start_year' => '2020', 'end_year' => '2022']],
                'documents' => [['name' => 'Maricel_Andrade_ValidID.jpg', 'type' => 'Valid ID']],
                'history' => [['date' => 'Jul 20, 2026', 'text' => 'Applicant registered'], ['date' => 'Jul 20, 2026', 'text' => 'Valid ID uploaded']],
            ],
            [
                'reg_id' => 'REG-002', 'first_name' => 'Cherry', 'middle_name' => 'Lopez', 'last_name' => 'Bacani', 'suffix' => '',
                'email' => 'cherry.bacani@email.com', 'phone' => '0918-442-9981', 'alternate_contact' => '',
                'city_address' => 'Caloocan City', 'provincial_address' => '', 'date_of_birth' => '2001-08-05',
                'gender' => 'Female', 'civil_status' => 'Single', 'nationality' => 'Filipino',
                'experience_summary' => '6 months retail experience', 'stage' => 'registered', 'status' => 'active', 'submission_source' => 'staff',
                'skills' => ['Cash handling', 'Customer assistance'],
                'work_history' => [['role' => 'Sales Clerk', 'company' => 'Puregold Caloocan', 'duration' => '2025 (6 months)']],
                'education' => [['level' => 'Senior High School', 'school' => 'Caloocan City Science HS', 'degree' => 'STEM Strand', 'start_year' => '2019', 'end_year' => '2021']],
                'documents' => [['name' => 'Cherry_Bacani_Resume.pdf', 'type' => 'Resume / CV']],
                'history' => [['date' => 'Jul 21, 2026', 'text' => 'Applicant registered'], ['date' => 'Jul 21, 2026', 'text' => 'Resume uploaded']],
            ],
            [
                'reg_id' => 'REG-003', 'first_name' => 'Mark', 'middle_name' => 'Dizon', 'last_name' => 'Villaruel', 'suffix' => '',
                'email' => 'mark.villaruel@email.com', 'phone' => '0920-113-7762', 'alternate_contact' => '',
                'city_address' => 'Quezon City', 'provincial_address' => '', 'date_of_birth' => '1999-12-01',
                'gender' => 'Male', 'civil_status' => 'Single', 'nationality' => 'Filipino',
                'experience_summary' => '1 year call center experience', 'stage' => 'registered', 'status' => 'active', 'submission_source' => 'staff',
                'skills' => ['Customer service', 'Basic troubleshooting'],
                'work_history' => [['role' => 'Customer Support Associate', 'company' => 'ConnectPH BPO', 'duration' => '2024 – 2025']],
                'education' => [['level' => "Bachelor's Degree (undergrad)", 'school' => 'University of the East', 'degree' => 'BS Psychology (2 yrs completed)', 'start_year' => '2019', 'end_year' => '2021']],
                'documents' => [['name' => 'Mark_Villaruel_CV.pdf', 'type' => 'Resume / CV']],
                'history' => [['date' => 'Jul 22, 2026', 'text' => 'Applicant registered'], ['date' => 'Jul 22, 2026', 'text' => 'Resume uploaded']],
            ],
            [
                'reg_id' => 'REG-004', 'first_name' => 'Julius', 'middle_name' => 'Santos', 'last_name' => 'Tabora', 'suffix' => '',
                'email' => 'julius.tabora@email.com', 'phone' => '0917-556-2210', 'alternate_contact' => '0917-990-1122',
                'city_address' => 'Valenzuela City', 'provincial_address' => '12 Rizal St.', 'date_of_birth' => '1998-04-12',
                'gender' => 'Male', 'civil_status' => 'Single', 'nationality' => 'Filipino',
                'category' => 'Warehousing & Logistics', 'target_job_id' => 'jo1',
                'experience_summary' => '2 years warehouse experience', 'stage' => 'profiling', 'status' => 'active', 'submission_source' => 'staff',
                'skills' => ['Inventory tallying', 'Pallet jack operation'],
                'work_history' => [['role' => 'Warehouse Helper', 'company' => 'CitiMart Distribution', 'duration' => '2023 – 2025']],
                'education' => [['level' => 'Senior High School', 'school' => 'Valenzuela City NHS', 'degree' => 'General Academic Strand', 'start_year' => '2020', 'end_year' => '2022']],
                'documents' => [['name' => 'Julius_Tabora_Resume.pdf', 'type' => 'Resume / CV']],
                'history' => [['date' => 'Jul 15, 2026', 'text' => 'Applicant registered'], ['date' => 'Jul 15, 2026', 'text' => 'Target job assigned: Warehouse Associate'], ['date' => 'Jul 16, 2026', 'text' => 'Started profiling']],
            ],
            [
                'reg_id' => 'REG-006', 'first_name' => 'Shaira', 'middle_name' => 'Reyes', 'last_name' => 'Domingo', 'suffix' => '',
                'email' => 'shaira.domingo@email.com', 'phone' => '0917-330-8891', 'alternate_contact' => '',
                'city_address' => 'Quezon City', 'provincial_address' => '45 Kalayaan Ave.', 'date_of_birth' => '1999-02-18',
                'gender' => 'Female', 'civil_status' => 'Single', 'nationality' => 'Filipino',
                'category' => 'Customer Service (BPO)', 'target_job_id' => 'jo5',
                'experience_summary' => '2 years BPO customer service', 'stage' => 'profiled', 'status' => 'active', 'submission_source' => 'staff',
                'skills' => ['Customer service', 'CRM tools', 'English proficiency'],
                'work_history' => [
                    ['role' => 'Customer Service Rep', 'company' => 'Northline BPO (previous account)', 'duration' => '2023 – 2025'],
                    ['role' => 'Retail Associate', 'company' => 'ShopWise Quezon Ave.', 'duration' => '2022 – 2023'],
                ],
                'education' => [['level' => "Bachelor's Degree", 'school' => 'Polytechnic University of the Philippines', 'degree' => 'BS Office Administration', 'start_year' => '2018', 'end_year' => '2022']],
                'documents' => [['name' => 'Shaira_Domingo_Resume.pdf', 'type' => 'Resume / CV']],
                'history' => [['date' => 'Jul 10, 2026', 'text' => 'Applicant registered'], ['date' => 'Jul 10, 2026', 'text' => 'Resume uploaded'], ['date' => 'Jul 11, 2026', 'text' => 'Started profiling'], ['date' => 'Jul 12, 2026', 'text' => 'Profile marked complete']],
            ],
            [
                'reg_id' => 'REG-008', 'first_name' => 'Angeline', 'middle_name' => 'Padilla', 'last_name' => 'Cortez', 'suffix' => '',
                'email' => 'angeline.cortez@email.com', 'phone' => '0920-774-2298', 'alternate_contact' => '',
                'city_address' => 'Boracay, Aklan', 'provincial_address' => '', 'date_of_birth' => '1993-09-09',
                'gender' => 'Female', 'civil_status' => 'Married', 'nationality' => 'Filipino',
                'category' => 'Hospitality & Front Desk', 'target_job_id' => 'jo17',
                'experience_summary' => '3 years hospitality front desk', 'stage' => 'profiled', 'status' => 'active', 'sent_to_recruitment' => true, 'submission_source' => 'staff',
                'skills' => ['Front desk operations', 'Guest relations', 'Booking systems'],
                'work_history' => [['role' => 'Front Desk Associate', 'company' => 'Boracay Sands Resort', 'duration' => '2022 – 2025']],
                'education' => [['level' => "Bachelor's Degree", 'school' => 'Aklan State University', 'degree' => 'BS Hospitality Management', 'start_year' => '2017', 'end_year' => '2021']],
                'documents' => [['name' => 'Angeline_Cortez_CV.pdf', 'type' => 'Resume / CV']],
                'history' => [['date' => 'Jul 05, 2026', 'text' => 'Applicant registered'], ['date' => 'Jul 06, 2026', 'text' => 'Started profiling'], ['date' => 'Jul 07, 2026', 'text' => 'Profile marked complete'], ['date' => 'Jul 08, 2026', 'text' => 'Sent to Recruitment & Selection']],
            ],
        ];

        foreach ($seedData as $data) {
            $skills = $data['skills'] ?? [];
            $workHistory = $data['work_history'] ?? [];
            $education = $data['education'] ?? [];
            $documents = $data['documents'] ?? [];
            $history = $data['history'] ?? [];

            unset($data['skills'], $data['work_history'], $data['education'], $data['documents'], $data['history']);

            $applicant = Applicant::create($data);

            foreach ($skills as $skill) {
                $applicant->skills()->create(['name' => $skill]);
            }
            foreach ($workHistory as $work) {
                $applicant->workHistory()->create($work);
            }
            foreach ($education as $edu) {
                $applicant->education()->create($edu);
            }
            foreach ($documents as $doc) {
                $applicant->documents()->create($doc);
            }
            foreach ($history as $h) {
                $applicant->history()->create($h);
            }
        }
    }
}
