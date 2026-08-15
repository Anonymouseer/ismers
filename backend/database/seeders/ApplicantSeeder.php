<?php

namespace Database\Seeders;

use App\Models\Applicant;
use Illuminate\Database\Seeder;

class ApplicantSeeder extends Seeder
{
    public function run(): void
    {
        $seedData = [
            // ── STAGE: REGISTERED ──
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
                'reg_id' => 'REG-009', 'first_name' => 'Gabriel', 'middle_name' => 'Santos', 'last_name' => 'Roxas', 'suffix' => '',
                'email' => 'gabriel.roxas@email.com', 'phone' => '0917-882-1009', 'alternate_contact' => '',
                'city_address' => 'Quezon City', 'provincial_address' => '', 'date_of_birth' => '2002-11-14',
                'gender' => 'Male', 'civil_status' => 'Single', 'nationality' => 'Filipino',
                'experience_summary' => 'Fresh IT Graduate with internship experience', 'stage' => 'registered', 'status' => 'active', 'submission_source' => 'staff',
                'skills' => ['Data Entry', 'MS Office', 'Basic Network Troubleshooting'],
                'work_history' => [['role' => 'IT Support Intern', 'company' => 'TechSolve Philippines', 'duration' => '2025 (4 months)']],
                'education' => [['level' => "Bachelor's Degree", 'school' => 'Quezon City University', 'degree' => 'BS Information Technology', 'start_year' => '2021', 'end_year' => '2025']],
                'documents' => [['name' => 'Gabriel_Roxas_CV.pdf', 'type' => 'Resume / CV']],
                'history' => [['date' => 'Aug 01, 2026', 'text' => 'Applicant registered via Portal']],
            ],
            [
                'reg_id' => 'REG-010', 'first_name' => 'Patricia', 'middle_name' => 'Mae', 'last_name' => 'Mendoza', 'suffix' => '',
                'email' => 'patricia.mendoza@email.com', 'phone' => '0919-332-9010', 'alternate_contact' => '',
                'city_address' => 'Pasig City', 'provincial_address' => '', 'date_of_birth' => '2001-05-23',
                'gender' => 'Female', 'civil_status' => 'Single', 'nationality' => 'Filipino',
                'experience_summary' => '10 months retail sales assistant', 'stage' => 'registered', 'status' => 'active', 'submission_source' => 'staff',
                'skills' => ['Store Operations', 'Customer Service', 'POS Cashiering'],
                'work_history' => [['role' => 'Retail Sales Clerk', 'company' => 'SM Store Megamall', 'duration' => '2025 – 2026']],
                'education' => [['level' => 'Senior High School', 'school' => 'Pasig City High School', 'degree' => 'ABM Strand', 'start_year' => '2019', 'end_year' => '2021']],
                'documents' => [['name' => 'Patricia_Mendoza_Resume.pdf', 'type' => 'Resume / CV']],
                'history' => [['date' => 'Aug 02, 2026', 'text' => 'Applicant registered']],
            ],
            [
                'reg_id' => 'REG-011', 'first_name' => 'Ramon', 'middle_name' => 'Carlos', 'last_name' => 'Dizon', 'suffix' => '',
                'email' => 'ramon.dizon@email.com', 'phone' => '0920-554-1011', 'alternate_contact' => '',
                'city_address' => 'Taguig City', 'provincial_address' => '', 'date_of_birth' => '1998-09-17',
                'gender' => 'Male', 'civil_status' => 'Single', 'nationality' => 'Filipino',
                'experience_summary' => '1 year warehouse logistics assistant', 'stage' => 'registered', 'status' => 'active', 'submission_source' => 'staff',
                'skills' => ['Stock Packing', 'Material Handling', 'Palletizing'],
                'work_history' => [['role' => 'Warehouse Crew', 'company' => 'Express Logistics Taguig', 'duration' => '2024 – 2025']],
                'education' => [['level' => 'High School', 'school' => 'Taguig National High School', 'degree' => 'High School Diploma', 'start_year' => '2014', 'end_year' => '2018']],
                'documents' => [['name' => 'Ramon_Dizon_ID.pdf', 'type' => 'Valid ID']],
                'history' => [['date' => 'Aug 03, 2026', 'text' => 'Applicant registered']],
            ],

            // ── STAGE: PROFILING ──
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
                'reg_id' => 'REG-012', 'first_name' => 'Lilibeth', 'middle_name' => 'Reyes', 'last_name' => 'Aquino', 'suffix' => '',
                'email' => 'lilibeth.aquino@email.com', 'phone' => '0917-661-2012', 'alternate_contact' => '',
                'city_address' => 'Makati City', 'provincial_address' => '142 Buendia Ave', 'date_of_birth' => '1996-01-30',
                'gender' => 'Female', 'civil_status' => 'Married', 'nationality' => 'Filipino',
                'category' => 'Retail & Store Operations', 'target_job_id' => 'jo13',
                'experience_summary' => '3 years administrative and front desk clerk', 'stage' => 'profiling', 'status' => 'active', 'submission_source' => 'staff',
                'skills' => ['Office Administration', 'Filing & Archiving', 'MS Excel', 'Scheduling'],
                'work_history' => [['role' => 'Admin Clerk', 'company' => 'Metro Office Solutions', 'duration' => '2022 – 2025']],
                'education' => [['level' => "Bachelor's Degree", 'school' => 'Pamantasan ng Lungsod ng Maynila', 'degree' => 'BS Business Administration', 'start_year' => '2014', 'end_year' => '2018']],
                'documents' => [['name' => 'Lilibeth_Aquino_CV.pdf', 'type' => 'Resume / CV']],
                'history' => [['date' => 'Jul 28, 2026', 'text' => 'Applicant registered'], ['date' => 'Jul 29, 2026', 'text' => 'Assigned category: Retail & Store Operations'], ['date' => 'Jul 30, 2026', 'text' => 'Started profiling']],
            ],
            [
                'reg_id' => 'REG-013', 'first_name' => 'Christian', 'middle_name' => 'Paul', 'last_name' => 'Dela Cruz', 'suffix' => '',
                'email' => 'christian.delacruz@email.com', 'phone' => '0918-772-3013', 'alternate_contact' => '',
                'city_address' => 'Mandaluyong City', 'provincial_address' => '', 'date_of_birth' => '1995-07-11',
                'gender' => 'Male', 'civil_status' => 'Single', 'nationality' => 'Filipino',
                'category' => 'Warehousing & Logistics', 'target_job_id' => 'jo2',
                'experience_summary' => '3 years certified heavy forklift operator', 'stage' => 'profiling', 'status' => 'active', 'submission_source' => 'staff',
                'skills' => ['Forklift Operation', 'WMS Tracking', 'Inventory Control', 'Pallet Stacking'],
                'work_history' => [['role' => 'Forklift Driver', 'company' => 'Universal Logistics Hub', 'duration' => '2022 – 2025']],
                'education' => [['level' => 'Vocational', 'school' => 'TESDA Technological Institute', 'degree' => 'Heavy Equipment Operation NC II', 'start_year' => '2020', 'end_year' => '2021']],
                'documents' => [['name' => 'Christian_DelaCruz_TESDA.pdf', 'type' => 'Certificate']],
                'history' => [['date' => 'Jul 26, 2026', 'text' => 'Applicant registered'], ['date' => 'Jul 27, 2026', 'text' => 'Assigned target job: Forklift Operator'], ['date' => 'Jul 28, 2026', 'text' => 'Started profiling']],
            ],
            [
                'reg_id' => 'REG-014', 'first_name' => 'Hannah', 'middle_name' => 'Sofia', 'last_name' => 'Naval', 'suffix' => '',
                'email' => 'hannah.naval@email.com', 'phone' => '0921-994-4014', 'alternate_contact' => '',
                'city_address' => 'Pasay City', 'provincial_address' => '', 'date_of_birth' => '2000-10-05',
                'gender' => 'Female', 'civil_status' => 'Single', 'nationality' => 'Filipino',
                'category' => 'Customer Service (BPO)', 'target_job_id' => 'jo5',
                'experience_summary' => '1.5 years inbound customer care representative', 'stage' => 'profiling', 'status' => 'active', 'submission_source' => 'staff',
                'skills' => ['Call Center Operations', 'Inbound Escalations', 'Customer Retention', 'CRM Navigation'],
                'work_history' => [['role' => 'Customer Service Rep', 'company' => 'Teleperformance Manila', 'duration' => '2024 – 2025']],
                'education' => [['level' => "Bachelor's Degree", 'school' => 'Far Eastern University', 'degree' => 'BS Mass Communication', 'start_year' => '2019', 'end_year' => '2023']],
                'documents' => [['name' => 'Hannah_Naval_Resume.pdf', 'type' => 'Resume / CV']],
                'history' => [['date' => 'Jul 25, 2026', 'text' => 'Applicant registered'], ['date' => 'Jul 26, 2026', 'text' => 'Started profiling']],
            ],

            // ── STAGE: PROFILED (READY) ──
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
                'reg_id' => 'REG-015', 'first_name' => 'Kenneth', 'middle_name' => 'James', 'last_name' => 'Bautista', 'suffix' => '',
                'email' => 'kenneth.bautista@email.com', 'phone' => '0917-112-5015', 'alternate_contact' => '',
                'city_address' => 'Caloocan City', 'provincial_address' => '', 'date_of_birth' => '1994-04-18',
                'gender' => 'Male', 'civil_status' => 'Married', 'nationality' => 'Filipino',
                'category' => 'Manufacturing', 'target_job_id' => 'jo9',
                'experience_summary' => '3 years industrial machine operator in high-volume plant', 'stage' => 'profiled', 'status' => 'active', 'submission_source' => 'staff',
                'skills' => ['Machine Operation', 'Quality Inspection', 'Industrial Safety', 'Troubleshooting'],
                'work_history' => [['role' => 'Production Line Operator', 'company' => 'Delta Manufacturing Philippines', 'duration' => '2022 – 2025']],
                'education' => [['level' => 'Vocational', 'school' => 'Valenzuela Polytechnic College', 'degree' => 'Industrial Machinery Tech', 'start_year' => '2018', 'end_year' => '2020']],
                'documents' => [['name' => 'Kenneth_Bautista_CV.pdf', 'type' => 'Resume / CV']],
                'history' => [['date' => 'Jul 12, 2026', 'text' => 'Applicant registered'], ['date' => 'Jul 13, 2026', 'text' => 'Started profiling'], ['date' => 'Jul 14, 2026', 'text' => 'Profile completed & verified ready']],
            ],
            [
                'reg_id' => 'REG-016', 'first_name' => 'Janice', 'middle_name' => 'Joy', 'last_name' => 'Alcantara', 'suffix' => '',
                'email' => 'janice.alcantara@email.com', 'phone' => '0919-443-6016', 'alternate_contact' => '',
                'city_address' => 'Manila', 'provincial_address' => '789 España Blvd', 'date_of_birth' => '1997-08-29',
                'gender' => 'Female', 'civil_status' => 'Single', 'nationality' => 'Filipino',
                'category' => 'Healthcare & Diagnostics', 'target_job_id' => 'jo27',
                'experience_summary' => '2.5 years medical reception & patient intake specialist', 'stage' => 'profiled', 'status' => 'active', 'submission_source' => 'staff',
                'skills' => ['Patient Registration', 'HMO Processing', 'Medical Records', 'Healthcare Front Desk'],
                'work_history' => [['role' => 'Patient Service Assistant', 'company' => 'Manila Doctors Hospital', 'duration' => '2023 – 2025']],
                'education' => [['level' => "Bachelor's Degree", 'school' => 'University of Santo Tomas', 'degree' => 'BS Medical Technology (Undergraduate)', 'start_year' => '2016', 'end_year' => '2019']],
                'documents' => [['name' => 'Janice_Alcantara_Resume.pdf', 'type' => 'Resume / CV']],
                'history' => [['date' => 'Jul 14, 2026', 'text' => 'Applicant registered'], ['date' => 'Jul 15, 2026', 'text' => 'Profiling completed'], ['date' => 'Jul 16, 2026', 'text' => 'Verified ready for assignment']],
            ],
            [
                'reg_id' => 'REG-017', 'first_name' => 'Ronaldo', 'middle_name' => 'Mateo', 'last_name' => 'Tolentino', 'suffix' => '',
                'email' => 'ronaldo.tolentino@email.com', 'phone' => '0920-885-7017', 'alternate_contact' => '',
                'city_address' => 'Valenzuela City', 'provincial_address' => '', 'date_of_birth' => '1992-03-08',
                'gender' => 'Male', 'civil_status' => 'Married', 'nationality' => 'Filipino',
                'category' => 'Construction & Engineering', 'target_job_id' => 'jo35',
                'experience_summary' => '4 years accredited safety officer in construction site projects', 'stage' => 'profiled', 'status' => 'active', 'submission_source' => 'staff',
                'skills' => ['BOSH Certified', 'Site Inspection', 'PPE Compliance', 'Hazard Assessment'],
                'work_history' => [['role' => 'Safety Inspector', 'company' => 'Apex Construction Builders', 'duration' => '2021 – 2025']],
                'education' => [['level' => "Bachelor's Degree", 'school' => 'Mapúa University', 'degree' => 'BS Industrial Engineering', 'start_year' => '2012', 'end_year' => '2017']],
                'documents' => [['name' => 'Ronaldo_Tolentino_BOSH.pdf', 'type' => 'Certification']],
                'history' => [['date' => 'Jul 18, 2026', 'text' => 'Applicant registered'], ['date' => 'Jul 19, 2026', 'text' => 'Profiling completed & safety certificates verified']],
            ],

            // ── STAGE: SENT TO RECRUITMENT ──
            [
                'reg_id' => 'REG-008', 'first_name' => 'Angeline', 'middle_name' => 'Padilla', 'last_name' => 'Cortez', 'suffix' => '',
                'email' => 'angeline.cortez@email.com', 'phone' => '0920-774-2298', 'alternate_contact' => '',
                'city_address' => 'Boracay, Aklan', 'provincial_address' => '', 'date_of_birth' => '1993-09-09',
                'gender' => 'Female', 'civil_status' => 'Married', 'nationality' => 'Filipino',
                'category' => 'Hospitality & Front Desk', 'target_job_id' => 'jo17',
                'experience_summary' => '3 years hospitality front desk', 'stage' => 'profiled', 'status' => 'active',
                'sent_to_recruitment' => true, 'recruitment_stage' => 'pooling', 'submission_source' => 'staff',
                'skills' => ['Front desk operations', 'Guest relations', 'Booking systems'],
                'work_history' => [['role' => 'Front Desk Associate', 'company' => 'Boracay Sands Resort', 'duration' => '2022 – 2025']],
                'education' => [['level' => "Bachelor's Degree", 'school' => 'Aklan State University', 'degree' => 'BS Hospitality Management', 'start_year' => '2017', 'end_year' => '2021']],
                'documents' => [['name' => 'Angeline_Cortez_CV.pdf', 'type' => 'Resume / CV']],
                'history' => [['date' => 'Jul 05, 2026', 'text' => 'Applicant registered'], ['date' => 'Jul 06, 2026', 'text' => 'Started profiling'], ['date' => 'Jul 07, 2026', 'text' => 'Profile marked complete'], ['date' => 'Jul 08, 2026', 'text' => 'Sent to Recruitment & Selection']],
            ],
            [
                'reg_id' => 'REG-005', 'first_name' => 'Andrea', 'middle_name' => 'Santos', 'last_name' => 'Molina', 'suffix' => '',
                'email' => 'andrea.molina@email.com', 'phone' => '0917-555-0192', 'alternate_contact' => '',
                'city_address' => 'Quezon City', 'provincial_address' => '45 Commonwealth Ave', 'date_of_birth' => '1997-04-15',
                'gender' => 'Female', 'civil_status' => 'Single', 'nationality' => 'Filipino',
                'category' => 'Hospitality & Front Desk', 'target_job_id' => 'jo1',
                'experience_summary' => '3 yrs Housekeeping and hotel facilities operations', 'stage' => 'profiled', 'status' => 'active',
                'sent_to_recruitment' => true, 'recruitment_stage' => 'for_deployment', 'submission_source' => 'staff',
                'recruiter_rating' => 5, 'assigned_manager' => 'Area Manager 1 (North NCR)', 'interview_platform' => 'Zoom Meeting',
                'client_endorsement_status' => 'Passed Client Interview',
                'screening_checklist' => ['requirements' => true, 'identity' => true, 'history' => true, 'reference' => true],
                'document_status' => ['resume' => true, 'certificate' => true, 'portfolio' => true],
                'interview_schedule' => ['title' => 'Client Final Interview', 'date' => 'Jul 20, 2026', 'time' => '10:00 AM', 'recruiter' => 'Seda Vertis North HR', 'completed' => true, 'completedAt' => 'Jul 20, 2026'],
                'pre_employment_checklist' => [
                    'medical_exam' => true, 'nbi_clearance' => true, 'sss_document' => true,
                    'philhealth_mdr' => true, 'pagibig_mid' => true, 'bir_tin' => true, 'psa_birth_cert' => true,
                ],
                'medical_referral' => ['clinic' => 'Hi-Precision Diagnostics', 'date' => 'Jul 21, 2026', 'status' => 'Fit to Work', 'issued' => true],
                'statutory_numbers' => ['sss' => '34-1234567-8', 'philhealth' => '12-345678901-2', 'pagibig' => '1234-5678-9012', 'tin' => '123-456-789-000'],
                'employment_contract' => ['status' => 'Signed', 'signed_date' => 'Jul 22, 2026', 'contract_ref' => 'CNT-2026-001'],
                'orientation_modules' => ['module1' => true, 'module2' => true, 'module3' => true, 'module4' => true, 'module5' => true, 'status' => 'Certified Completed', 'completed_date' => 'Jul 22, 2026'],
                'atm_endorsement' => ['bank' => 'BDO Unibank', 'account_status' => 'Endorsed', 'account_number' => 'xxxx-xxxx-4491'],
                'deployment_details' => ['client' => 'Seda Vertis North', 'job_order' => 'JO-001', 'position' => 'Housekeeping Supervisor', 'start_date' => 'Jul 24, 2026', 'reporting_to' => 'Cecille Lim (Hotel GM)', 'site' => 'Vertis North, Astra cor. Lux Drive, QC', 'shift' => 'Morning Shift (06:00 - 15:00)', 'status' => 'Ready for Site Handover'],
                'ppe_issuance' => ['uniformShirt' => true, 'shirtSize' => 'M', 'safetyShoes' => true, 'shoeSize' => '38', 'safetyVest' => true, 'idBadge' => true, 'whistleKit' => true],
                'skills' => ['Housekeeping Supervision', 'Room Sanitation', 'Inventory Tallying', 'Customer Relations'],
                'work_history' => [
                    ['role' => 'Housekeeping Associate', 'company' => 'Seda Vertis North', 'duration' => '2023 – 2025'],
                    ['role' => 'Room Attendant', 'company' => 'City Garden Hotel', 'duration' => '2021 – 2023'],
                ],
                'education' => [['level' => "Bachelor's Degree", 'school' => 'Polytechnic University of the Philippines', 'degree' => 'BS Hospitality Management', 'start_year' => '2017', 'end_year' => '2021']],
                'documents' => [
                    ['name' => 'Andrea_Molina_Resume.pdf', 'type' => 'Resume / CV'],
                    ['name' => 'Andrea_Molina_Medical.pdf', 'type' => 'Medical Clearance'],
                    ['name' => 'Andrea_Molina_NBI.pdf', 'type' => 'NBI Clearance'],
                ],
                'history' => [
                    ['date' => 'Jul 01, 2026', 'text' => 'Applicant registered and profiled'],
                    ['date' => 'Jul 15, 2026', 'text' => 'Passed Area Manager 2nd Interview'],
                    ['date' => 'Jul 20, 2026', 'text' => 'Passed Client Final Interview at Seda Vertis North'],
                    ['date' => 'Jul 22, 2026', 'text' => 'Completed all 7/7 pre-employment clearances, signed contract, and completed orientation modules'],
                    ['date' => 'Jul 24, 2026', 'text' => 'Marked Ready For Deployment'],
                ],
            ],
            [
                'reg_id' => 'REG-007', 'first_name' => 'Jomar', 'middle_name' => 'Dela Cruz', 'last_name' => 'Villagracia', 'suffix' => '',
                'email' => 'jomar.villagracia@email.com', 'phone' => '0918-444-7890', 'alternate_contact' => '',
                'city_address' => 'Pasig City', 'provincial_address' => '12 Ortigas Ext', 'date_of_birth' => '1998-08-22',
                'gender' => 'Male', 'civil_status' => 'Single', 'nationality' => 'Filipino',
                'category' => 'Food & Beverage (F&B / Cook)', 'target_job_id' => 'jo2',
                'experience_summary' => '2 yrs F&B service crew and food handling', 'stage' => 'profiled', 'status' => 'active',
                'sent_to_recruitment' => true, 'recruitment_stage' => 'contract_signing', 'submission_source' => 'staff',
                'recruiter_rating' => 4, 'assigned_manager' => 'Area Manager 2 (East NCR)', 'interview_platform' => 'Face to Face',
                'client_endorsement_status' => 'Passed Client Interview',
                'screening_checklist' => ['requirements' => true, 'identity' => true, 'history' => true, 'reference' => true],
                'document_status' => ['resume' => true, 'certificate' => true, 'portfolio' => true],
                'pre_employment_checklist' => [
                    'medical_exam' => true, 'nbi_clearance' => true, 'sss_document' => true,
                    'philhealth_mdr' => true, 'pagibig_mid' => true, 'bir_tin' => true, 'psa_birth_cert' => true,
                ],
                'statutory_numbers' => ['sss' => '34-5566778-9', 'philhealth' => '12-778899001-3', 'pagibig' => '1234-9988-1122', 'tin' => '234-567-890-000'],
                'employment_contract' => ['status' => 'Signed', 'signed_date' => 'Jul 22, 2026', 'contract_ref' => 'CNT-2026-002'],
                'skills' => ['Food Prep', 'POS Operation', 'Customer Service', 'Sanitation'],
                'work_history' => [['role' => 'Service Crew', 'company' => 'Vikings Luxury Buffet', 'duration' => '2023 – 2025']],
                'education' => [['level' => 'Senior High School', 'school' => 'Pasig Catholic College', 'degree' => 'TVL - Food & Beverage Strand', 'start_year' => '2018', 'end_year' => '2020']],
                'documents' => [['name' => 'Jomar_Villagracia_Resume.pdf', 'type' => 'Resume / CV']],
                'history' => [
                    ['date' => 'Jul 05, 2026', 'text' => 'Applicant registered'],
                    ['date' => 'Jul 18, 2026', 'text' => 'Passed Client Interview at Vikings Buffet'],
                    ['date' => 'Jul 22, 2026', 'text' => 'Proceeded to Orientation & Contract Signing'],
                ],
            ],
            [
                'reg_id' => 'REG-018', 'first_name' => 'Michael', 'middle_name' => 'Lim', 'last_name' => 'Tan', 'suffix' => '',
                'email' => 'michael.tan@email.com', 'phone' => '0919-555-1188', 'alternate_contact' => '',
                'city_address' => 'Mandaluyong City', 'provincial_address' => '', 'date_of_birth' => '1999-11-05',
                'gender' => 'Male', 'civil_status' => 'Single', 'nationality' => 'Filipino',
                'category' => 'Food & Beverage (F&B / Cook)', 'target_job_id' => 'jo2',
                'experience_summary' => '1.5 yrs F&B service and dining assistant', 'stage' => 'profiled', 'status' => 'active',
                'sent_to_recruitment' => true, 'recruitment_stage' => 'hr_requirements', 'submission_source' => 'staff',
                'client_endorsement_status' => 'Passed Client Interview',
                'screening_checklist' => ['requirements' => true, 'identity' => true, 'history' => true, 'reference' => true],
                'document_status' => ['resume' => true, 'certificate' => true, 'portfolio' => false],
                'medical_referral' => ['clinic' => 'HealthHub Diagnostics', 'date' => 'Jul 23, 2026', 'status' => 'Referral Issued', 'issued' => true],
                'pre_employment_checklist' => [
                    'medical_exam' => false, 'nbi_clearance' => true, 'sss_document' => true,
                    'philhealth_mdr' => true, 'pagibig_mid' => false, 'bir_tin' => true, 'psa_birth_cert' => true,
                ],
                'skills' => ['Table Service', 'Dining Prep', 'Sanitation Standards'],
                'work_history' => [['role' => 'Dining Assistant', 'company' => 'SM Megamall Food Hall', 'duration' => '2024 – 2025']],
                'education' => [['level' => 'Senior High School', 'school' => 'Mandaluyong High School', 'degree' => 'General Academic', 'start_year' => '2019', 'end_year' => '2021']],
                'documents' => [['name' => 'Michael_Tan_CV.pdf', 'type' => 'Resume / CV']],
                'history' => [
                    ['date' => 'Jul 10, 2026', 'text' => 'Applicant registered'],
                    ['date' => 'Jul 23, 2026', 'text' => 'Passed Client Final Interview; Medical referral issued'],
                ],
            ],
            [
                'reg_id' => 'REG-019', 'first_name' => 'Carlo', 'middle_name' => 'Antonio', 'last_name' => 'Dizon', 'suffix' => '',
                'email' => 'carlo.dizon@email.com', 'phone' => '0920-777-3319', 'alternate_contact' => '',
                'city_address' => 'Makati City', 'provincial_address' => '', 'date_of_birth' => '1996-06-18',
                'gender' => 'Male', 'civil_status' => 'Single', 'nationality' => 'Filipino',
                'category' => 'Food & Beverage (F&B / Cook)', 'target_job_id' => 'jo3',
                'experience_summary' => '2 yrs Line Cook and commercial kitchen assistant', 'stage' => 'profiled', 'status' => 'active',
                'sent_to_recruitment' => true, 'recruitment_stage' => 'client_interview', 'submission_source' => 'staff',
                'client_endorsement_status' => 'Accepted for Interview',
                'interview_schedule' => ['title' => 'Client Final Interview', 'date' => 'Jul 26, 2026', 'time' => '2:00 PM', 'recruiter' => 'Y2 Hotel HR Manager'],
                'skills' => ['Line Cooking', 'Food Safety', 'Prep Work', 'Kitchen Maintenance'],
                'work_history' => [['role' => 'Commis Cook', 'company' => 'Makati Bistro & Grill', 'duration' => '2023 – 2025']],
                'education' => [['level' => 'Vocational', 'school' => 'TESDA Culinary Center', 'degree' => 'Commercial Cooking NC II', 'start_year' => '2020', 'end_year' => '2021']],
                'documents' => [['name' => 'Carlo_Dizon_CV.pdf', 'type' => 'Resume / CV']],
                'history' => [
                    ['date' => 'Jul 12, 2026', 'text' => 'Applicant registered'],
                    ['date' => 'Jul 18, 2026', 'text' => 'Endorsed for Client Interview with Y2 Hotel'],
                ],
            ],
            [
                'reg_id' => 'REG-020', 'first_name' => 'Bea', 'middle_name' => 'Marie', 'last_name' => 'Fernandez', 'suffix' => '',
                'email' => 'bea.fernandez@email.com', 'phone' => '0917-888-4420', 'alternate_contact' => '',
                'city_address' => 'Manila', 'provincial_address' => '', 'date_of_birth' => '2000-03-12',
                'gender' => 'Female', 'civil_status' => 'Single', 'nationality' => 'Filipino',
                'category' => 'Hospitality & Front Desk', 'target_job_id' => 'jo4',
                'experience_summary' => '1 yr Front Desk Receptionist', 'stage' => 'profiled', 'status' => 'active',
                'sent_to_recruitment' => true, 'recruitment_stage' => 'area_manager', 'submission_source' => 'staff',
                'interview_schedule' => ['title' => 'Area Manager 2nd Interview', 'date' => 'Jul 25, 2026', 'time' => '10:00 AM', 'recruiter' => 'Area Supervisor'],
                'skills' => ['Front Desk', 'Telephone Etiquette', 'Visitor Logging', 'MS Word'],
                'work_history' => [['role' => 'Front Desk Clerk', 'company' => 'City Garden Hotel', 'duration' => '2024 – 2025']],
                'education' => [['level' => "Bachelor's Degree", 'school' => 'University of the East', 'degree' => 'BS Tourism Management', 'start_year' => '2019', 'end_year' => '2023']],
                'documents' => [['name' => 'Bea_Fernandez_Resume.pdf', 'type' => 'Resume / CV']],
                'history' => [
                    ['date' => 'Jul 15, 2026', 'text' => 'Applicant registered'],
                    ['date' => 'Jul 16, 2026', 'text' => 'Endorsed to Area Manager for 2nd Interview evaluation'],
                ],
            ],
            [
                'reg_id' => 'REG-021', 'first_name' => 'Rico', 'middle_name' => 'Alcantara', 'last_name' => 'Manalo', 'suffix' => '',
                'email' => 'rico.manalo@email.com', 'phone' => '0921-999-5521', 'alternate_contact' => '',
                'city_address' => 'Valenzuela City', 'provincial_address' => '', 'date_of_birth' => '1997-09-29',
                'gender' => 'Male', 'civil_status' => 'Single', 'nationality' => 'Filipino',
                'category' => 'Warehousing & Logistics', 'target_job_id' => 'jo5',
                'experience_summary' => '1 yr Warehouse packing and logistics sorting', 'stage' => 'profiled', 'status' => 'active',
                'sent_to_recruitment' => true, 'recruitment_stage' => 'pooling', 'submission_source' => 'staff',
                'skills' => ['Inventory Sorting', 'Pallet Packing', 'Barcode Scanning'],
                'work_history' => [['role' => 'Warehouse Staff', 'company' => 'ABC Logistics Hub', 'duration' => '2024 – 2025']],
                'education' => [['level' => 'High School', 'school' => 'Valenzuela National High School', 'degree' => 'High School Diploma', 'start_year' => '2014', 'end_year' => '2018']],
                'documents' => [['name' => 'Rico_Manalo_CV.pdf', 'type' => 'Resume / CV']],
                'history' => [
                    ['date' => 'Jul 20, 2026', 'text' => 'Applicant registered and categorized for Warehouse pooling'],
                ],
            ],
            [
                'reg_id' => 'REG-022', 'first_name' => 'Vince', 'middle_name' => 'Gabriel', 'last_name' => 'Ocampo', 'suffix' => '',
                'email' => 'vince.ocampo@email.com', 'phone' => '0918-111-6622', 'alternate_contact' => '',
                'city_address' => 'Caloocan City', 'provincial_address' => '', 'date_of_birth' => '2001-01-10',
                'gender' => 'Male', 'civil_status' => 'Single', 'nationality' => 'Filipino',
                'category' => 'Hospitality & Front Desk', 'target_job_id' => 'jo1',
                'experience_summary' => '6 months hotel housekeeping trainee', 'stage' => 'profiled', 'status' => 'active',
                'sent_to_recruitment' => true, 'recruitment_stage' => 're_pooling', 'submission_source' => 'staff',
                'client_endorsement_status' => 'Declined',
                'skills' => ['Room Cleaning', 'Linen Change', 'Public Area Maintenance'],
                'work_history' => [['role' => 'Housekeeping Trainee', 'company' => 'North Hotel Manila', 'duration' => '2025 (6 months)']],
                'education' => [['level' => 'Senior High School', 'school' => 'Caloocan High School', 'degree' => 'TVL Strand', 'start_year' => '2019', 'end_year' => '2021']],
                'documents' => [['name' => 'Vince_Ocampo_Resume.pdf', 'type' => 'Resume / CV']],
                'history' => [
                    ['date' => 'Jul 08, 2026', 'text' => 'Applicant registered'],
                    ['date' => 'Jul 19, 2026', 'text' => 'Client interview: Declined. Returned to Main Office Pooling for line-up to other clients'],
                ],
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
