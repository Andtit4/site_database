'use client'

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { siteCustomFieldsService, SiteCustomField } from '@/services/siteCustomFieldsService';

export const useCustomFields = () => {
  const { user } = useAuth();
  const [fields, setFields] = useState<SiteCustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFields();
  }, [user?.departmentId, user?.isAdmin]);

  const loadFields = async () => {
    if (!user) {
      setFields([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Récupérer les champs actifs selon le département de l'utilisateur
      const departmentId = user.departmentId?.toString();
      const data = await siteCustomFieldsService.getActive(departmentId, user.isAdmin);
      
      setFields(data);
    } catch (err: any) {
      console.error('Erreur lors du chargement des champs personnalisés:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des champs');
      setFields([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshFields = () => {
    loadFields();
  };

  return {
    fields,
    loading,
    error,
    refreshFields,
    isAdmin: user?.isAdmin || false,
    userDepartmentId: user?.departmentId?.toString() || null
  };
}; 
