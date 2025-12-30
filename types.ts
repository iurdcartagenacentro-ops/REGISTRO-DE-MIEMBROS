
export enum MaritalStatus {
  SINGLE = 'Soltero/a',
  MARRIED = 'Casado/a',
  DIVORCED = 'Divorciado/a',
  WIDOWED = 'Viudo/a',
  UNION = 'Unión Libre'
}

export enum ChurchGroup {
  EVG = 'EVG',
  FTU = 'FTU',
  FJU = 'FJU',
  EBI = 'EBI',
  CALEB = 'CALEB',
  NONE = 'NINGUNO'
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  barrio: string;
  ciudad: string;
  departamento: string;
  birthDate: string;
  baptismDate?: string;
  joinDate: string;
  maritalStatus: MaritalStatus;
  churchName: string;
  churchTime: string;
  group: ChurchGroup;
  imageUrl?: string;
  signatureUrl?: string;
}

export interface ChurchStats {
  totalMembers: number;
  groupDistribution: { name: string; value: number }[];
}
