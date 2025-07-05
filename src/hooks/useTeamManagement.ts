import { useState, useEffect } from 'react';
import { staffAPI } from '../services/api';
import { Staff } from '../types';

export const useTeamManagement = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const response = await staffAPI.getAll();
      setStaff(response.data.staff || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addStaff = async (newStaff: Omit<Staff, 'id' | 'joinDate'>) => {
    try {
      const response = await staffAPI.create(newStaff);
      setStaff(prev => [...prev, response.data]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding staff:', error);
      alert('Failed to add team member');
    }
  };

  const updateStaff = async (updatedStaff: Staff) => {
    try {
      const response = await staffAPI.update(updatedStaff.id, updatedStaff);
      setStaff(prev => 
        prev.map(member => 
          member.id === updatedStaff.id ? response.data : member
        )
      );
      setIsEditModalOpen(false);
      setSelectedStaff(null);
    } catch (error) {
      console.error('Error updating staff:', error);
      alert('Failed to update team member');
    }
  };

  const deleteStaff = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        await staffAPI.delete(id);
        setStaff(prev => prev.filter(member => member.id !== id));
      } catch (error) {
        console.error('Error deleting staff:', error);
        alert('Failed to remove team member');
      }
    }
  };

  const openEditModal = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setIsEditModalOpen(true);
  };

  return {
    staff,
    isLoading,
    isAddModalOpen,
    isEditModalOpen,
    selectedStaff,
    setIsAddModalOpen,
    setIsEditModalOpen,
    addStaff,
    updateStaff,
    deleteStaff,
    openEditModal,
    refreshData: fetchStaff,
  };
};