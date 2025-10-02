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


type GroupByCompany = {
    companyId: string;      // the id from allClients
    companyName: string;    // the readable company name
    ccCharge: number;       // company charge count
    crewCharge: number;     // crew charge count
}

export const GET_CUSTOMERS_GROUP_BY_COMPANY = async (
    trainColl: TRAINING_BY_ID[],
    traineeColl: TRAINEE_BY_ID[],
    registrationColl: REGISTRATION_BY_ID[]
  ) => {
    try {
      type GroupByCompany = {
        company: string;
        ccCharge: number;   // count of accountType === 0
        crewCharge: number; // count of accountType === 1
      };
      
      const group_by_company: GroupByCompany[] = [];
      
      // Use a Map for efficient grouping
      const companyMap = new Map<string, { ccCharge: number; crewCharge: number }>();
  
      trainColl.forEach((training) => {
        // Find registration
        const reg = registrationColl.find((r) => r.id === training.reg_ref_id);
        if (!reg) return;
  
        // Find trainee
        const trainee = traineeColl.find((t) => t.id === reg.trainee_ref_id);
        if (!trainee) return;
  
        const company = trainee.company || "UNKNOWN";
  
        // Initialize if not in map
        if (!companyMap.has(company)) {
          companyMap.set(company, { ccCharge: 0, crewCharge: 0 });
        }
  
        // Count based on account type
        if (reg.reg_accountType === 1) {
          companyMap.get(company)!.ccCharge += 1;
        } else if (reg.reg_accountType === 0) {
          companyMap.get(company)!.crewCharge += 1;
        }
        console.log("tainee")
      console.log(trainee)
      console.log("reg")
      console.log(reg)
      });
      // Convert map to array
      companyMap.forEach((value, key) => {
        group_by_company.push({
          company: key,
          ccCharge: value.ccCharge,
          crewCharge: value.crewCharge,
        });
      });
      return group_by_company;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  
