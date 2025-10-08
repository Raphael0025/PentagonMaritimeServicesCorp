import { TRAINING_BY_ID, REGISTRATION_BY_ID, TRAINEE_BY_ID } from '@/types/trainees'
import { ClientCompanyByID } from '@/types/client_company'
import { GET_MONTHLY_DATA } from '@/lib/trainee_controller'   

export const GET_TOTAL_COUNT_MONTHLY = async (trainColl: TRAINING_BY_ID[], field: string) => {
    try{
        switch(field){
            case 'overall':
                return trainColl.length
            case 'company':
                return trainColl.filter((t) => t.accountType === 1).length
            case 'accountMgmtOff':
                return 0
            case 'consultancy':
                return trainColl.filter((t) => t.marketing === "consultancy").length
            case 're_enrolled':
                return trainColl.filter((t) => t.marketing === "re-enrolled").length
            case 'walkIn':
                return trainColl.filter((t) => t.marketing === "walk-in").length
            case 'agent':
                return trainColl.filter((t) => t.marketing === "agent").length
            case 'fb':
                return trainColl.filter((t) => t.marketing === "fb").length
            case 'others':
                return trainColl.filter((t) => t.marketing === "others").length
            case 'inquiry':
                return 0
            case 'cancelled':
                return trainColl.filter((t) => t.reg_status === 7).length
            case 'visitors':
                return 0

            default:
                return 0
        }
    }catch(error){
        console.error(error)
        return 0
    }
}

export const GET_CUSTOMERS_GROUP_BY_COMPANY = async ( trainColl: TRAINING_BY_ID[], traineeColl: TRAINEE_BY_ID[], registrationColl: REGISTRATION_BY_ID[], allClients: ClientCompanyByID[]) => {
  try {
    type GroupByCompany = {
      company: string;
      ccCharge: number;   // count of accountType === 0
      crewCharge: number; // count of accountType === 1
    }
      
    const group_by_company: GroupByCompany[] = [];
    
    allClients?.forEach((client_company) => {
      trainColl.forEach((training) => {
        const registration = registrationColl.find((reg) => reg.id === training.reg_ref_id)
        if(!registration) return

        const trainee = traineeColl.find((trainee) => trainee.id === registration.trainee_ref_id)
        if(!trainee) return

        if (trainee.company === client_company.id) {
          // check if company already exists in group_by_company
          let existing = group_by_company.find(g => g.company === client_company.company);

          if (!existing) {
            existing = {
              company: client_company.company,
              ccCharge: training.accountType === 1 ? 1 : 0,
              crewCharge: training.accountType === 0 ? 1 : 0
            }
            group_by_company.push(existing);
          } else {
            if (training.accountType === 1) {
              existing.ccCharge += 1;
            } else if (training.accountType === 0) {
              existing.crewCharge += 1;
            }
          }
        }
      })
    })
    
    return group_by_company;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const GET_CUSTOMERS_GROUP_BY_UNTAPPED_COMPANY = async ( trainColl: TRAINING_BY_ID[], traineeColl: TRAINEE_BY_ID[], registrationColl: REGISTRATION_BY_ID[], allClients: ClientCompanyByID[]) => {
  try {
    type GroupByCompany = {
      company: string;
      ccCharge: number;   // count of accountType === 0
      crewCharge: number; // count of accountType === 1
    }
      
    const group_by_company: GroupByCompany[] = [];
    
    
      trainColl.forEach((training) => {
        const registration = registrationColl.find((reg) => reg.id === training.reg_ref_id)
        if(!registration) return

        const trainee = traineeColl.find((trainee) => trainee.id === registration.trainee_ref_id)
        if(!trainee) return

        // check if company already exists in group_by_company
        const existing = group_by_company.find(g => g.company === trainee.company);

        if (!existing) {
          group_by_company.push({
            company: trainee.company,
            ccCharge: training.accountType === 1 ? 1 : 0,
            crewCharge: training.accountType === 0 ? 1 : 0
          });
        } else {
          if (training.accountType === 1) {
            existing.ccCharge += 1;
          } else if (training.accountType === 0) {
            existing.crewCharge += 1;
          }
        }
        
      })
    
    return group_by_company;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
