import { useState } from 'react';
import { Staff } from '../types';
import { mockStaff } from '../data/mockData';

export const useTeamManagement = () => {
  const [staff, setStaff] = useState<Staff[]>(mockStaff);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const addStaff = (newStaff: Omit<Staff, 'id' | 'joinDate'>) => {
    const staffMember: Staff = {
      ...newStaff,
      id: Date.now().toString(),
      joinDate: new Date()
    };
    setStaff(prev => [...prev, staffMember]);
    setIsAddModalOpen(false);
  };

  const updateStaff = (updatedStaff: Staff) => {
    setStaff(prev => 
      prev.map(member => 
        member.id === updatedStaff.id ? updatedStaff : member
      )
    );
    setIsEditModalOpen(false);
    setSelectedStaff(null);
  };

  const deleteStaff = (id: string) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      setStaff(prev => prev.filter(member => member.id !== id));
    }
  };

  const openEditModal = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setIsEditModalOpen(true);
  };

  return {
    staff,
    isAddModalOpen,
    isEditModalOpen,
    selectedStaff,
    setIsAddModalOpen,
    setIsEditModalOpen,
    addStaff,
    updateStaff,
    deleteStaff,
    openEditModal
  };
};