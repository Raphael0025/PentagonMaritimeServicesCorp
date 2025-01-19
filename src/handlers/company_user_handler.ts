import Swal from 'sweetalert2'
import { GetAllCompanyUsers, GetCompanyUserSpecificData, Role} from '@/types/company_users'
import { format } from 'date-fns'
import { Timestamp } from 'firebase/firestore'

export const countCompanyUsersByCategoryStatusAndType = async (company_users: GetAllCompanyUsers[] | null) => {
    if(!company_users){
        return { total_staff: 0, teachingStaffArray: [], total_candidates: 0, total_teaching_staff: 0, total_non_teaching_staff: 0, total_online: 0, total_walk_in: 0, total_hired_users: 0, total_probation_users: 0, }
    }

    const teachingStaffArray = company_users.filter(company_user => 
        Object.values(company_user.roles).some(role => role.emp_cat === 'Teaching Staff')
    );

    const nonTeachingStaffArray = company_users.filter(company_user => 
        Object.values(company_user.roles).some(role => role.emp_cat === 'Non-Teaching Staff')
    );

    const tts = teachingStaffArray.length
    const tnts = nonTeachingStaffArray.length
    
    const total_online = company_users.filter(staff => staff.application_type === 'Online').length
    const total_walk_in = company_users.filter(staff => staff.application_type === 'Walk-in').length
    const total_hired = company_users.filter(staff => staff.emp_status === 'Hired').length
    const total_in_probation = company_users.filter(staff => staff.emp_status === 'In Probation').length
    const total_candidate_count = Number(total_online) + Number(total_walk_in)

    return { total_staff: company_users.length, teachingStaffArray, total_candidates: total_candidate_count, total_teaching_staff: tts, total_non_teaching_staff: tnts, total_online: total_online, total_walk_in: total_walk_in, total_hired_users: total_hired, total_probation_users: total_in_probation, }
}

export const getUserPerStatusOf = async (emp_status: string, company_users: GetAllCompanyUsers[] | null) => {
    if(!company_users) return []

    const CompanyUsersPerStatus: GetCompanyUserSpecificData[] = []

    company_users.filter(company_user => company_user.emp_status === emp_status).forEach((company_user) => {
        const roles: Record<string, Role> = company_user.roles;

        let departments: string[] = [];
        let jobPositions: string[] = [];

        // Iterate over the keys (role IDs) of the roles object
        Object.keys(roles).forEach((roleId) => {
            const role = roles[roleId];
            departments.push(role.department)
            jobPositions.push(role.job_position)
        });

        const candidate: GetCompanyUserSpecificData = {
            id: company_user.id,
            candidate_added: company_user.candidate_added,
            user_code: company_user.user_code,
            full_name: company_user.full_name,
            emp_status: company_user.emp_status,
            application_type: company_user.application_type,
            department: departments.join(" / "),
            job_position: jobPositions.join(" / "),
        };
        CompanyUsersPerStatus.push(candidate);
    })

    return CompanyUsersPerStatus
}
