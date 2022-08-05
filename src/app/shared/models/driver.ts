export interface Driver {
    driver?: {
        firstName?: string,
        lastName?: string,
        email?: string,
        mobile?: string,
        day?: number,
        month?: string,
        year?: number,
        _id?: string,
    },
    driverDetail?: {
        drivingFromMonth?: string,
        drivingFromYear?: string,
        languages?: any,
        chauffeurLicenseNumber?: string,
        licenseNumber?: string,
        rate?: number,
        about?: string
       
    }
    profileDocumentPhoto?: any[],
    driverLiscense?: any[]
    
}
