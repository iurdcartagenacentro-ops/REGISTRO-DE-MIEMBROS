
import { Member } from '../types';

const STORAGE_KEY = 'eclesia_members_data';

export const storageService = {
  getMembers: (): Member[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error al leer de LocalStorage", e);
      return [];
    }
  },

  saveMembers: (members: Member[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  },

  addMember: (member: Member): void => {
    const members = storageService.getMembers();
    storageService.saveMembers([...members, member]);
  },

  updateMember: (updatedMember: Member): void => {
    const members = storageService.getMembers();
    const index = members.findIndex(m => m.id === updatedMember.id);
    if (index !== -1) {
      members[index] = updatedMember;
      storageService.saveMembers(members);
    }
  },

  deleteMember: (id: string): void => {
    const members = storageService.getMembers();
    storageService.saveMembers(members.filter(m => m.id !== id));
  },

  exportData: () => {
    const members = storageService.getMembers();
    const dataStr = JSON.stringify(members, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `Respaldo_Miembros_Universal_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  },

  importData: (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (Array.isArray(json)) {
            storageService.saveMembers(json);
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (e) {
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  }
};
