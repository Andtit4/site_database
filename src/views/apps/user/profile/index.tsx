'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  Chip,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  CircularProgress
} from '@mui/material'
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
  Groups as GroupsIcon,
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  Key as KeyIcon
} from '@mui/icons-material'

import { useAuth } from '@/hooks/useAuth'
import authService from '@/services/authService'

interface ProfileFormData {
  firstName: string
  lastName: string
  email: string
  username: string
}

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const UserProfile = () => {
  const { user, loading } = useAuth()
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    username: ''
  })
  const [originalData, setOriginalData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    username: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) {
      const userData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        username: user.username || ''
      }
      setFormData(userData)
      setOriginalData(userData)
    }
  }, [user])

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEditToggle = () => {
    if (editMode) {
      // Annuler les modifications
      setFormData(originalData)
      setError(null)
    }
    setEditMode(!editMode)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      
      // Appel API réel pour mettre à jour le profil
      await authService.updateProfile(formData)
      
      setOriginalData(formData)
      setEditMode(false)
      setSuccess('Profil mis à jour avec succès !')
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(null), 3000)
      
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du profil')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = (field: keyof PasswordFormData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Effacer l'erreur pour ce champ
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validatePassword = (): boolean => {
    const errors: Record<string, string> = {}

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Le mot de passe actuel est requis'
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'Le nouveau mot de passe est requis'
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères'
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Veuillez confirmer le nouveau mot de passe'
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'Le nouveau mot de passe doit être différent de l\'actuel'
    }

    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePasswordSubmit = async () => {
    if (!validatePassword()) return

    try {
      setSaving(true)
      setError(null)
      
      // Appel API réel pour changer le mot de passe
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword)
      
      setPasswordDialogOpen(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setSuccess('Mot de passe modifié avec succès !')
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(null), 3000)
      
    } catch (err: any) {
      setError(err.message || 'Erreur lors du changement de mot de passe')
    } finally {
      setSaving(false)
    }
  }

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const getUserInitials = () => {
    if (!user) return 'U'
    const firstInitial = user.firstName?.charAt(0) || ''
    const lastInitial = user.lastName?.charAt(0) || ''
    return (firstInitial + lastInitial).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'
  }

  const getRoleLabel = () => {
    if (!user) return 'Utilisateur'
    if (user.isAdmin) return 'Administrateur'
    if (user.isDepartmentAdmin) return 'Administrateur de département'
    if (user.isTeamMember) return 'Membre d\'équipe'
    return 'Utilisateur'
  }

  const getRoleColor = () => {
    if (!user) return 'default'
    if (user.isAdmin) return 'error'
    if (user.isDepartmentAdmin) return 'warning'
    if (user.isTeamMember) return 'info'
    return 'default'
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    return (
      <Alert severity="error">
        Impossible de charger les informations de profil. Veuillez vous reconnecter.
      </Alert>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mon Profil
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Carte d'informations principales */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem'
                }}
              >
                {getUserInitials()}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {user.firstName} {user.lastName}
              </Typography>
              
              <Typography variant="body2" color="textSecondary" gutterBottom>
                @{user.username}
              </Typography>

              <Chip
                label={getRoleLabel()}
                color={getRoleColor() as any}
                sx={{ mt: 1, mb: 2 }}
              />

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2">{user.email}</Typography>
                </Box>
                
                {user.departmentId && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon fontSize="small" color="action" />
                    <Typography variant="body2">Département ID: {user.departmentId}</Typography>
                  </Box>
                )}
                
                {user.teamId && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GroupsIcon fontSize="small" color="action" />
                    <Typography variant="body2">Équipe ID: {user.teamId}</Typography>
                  </Box>
                )}
              </Box>

              <Button
                variant="outlined"
                startIcon={<KeyIcon />}
                onClick={() => setPasswordDialogOpen(true)}
                sx={{ mt: 3 }}
                fullWidth
              >
                Changer le mot de passe
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Formulaire d'édition */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Informations personnelles
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {editMode ? (
                    <>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={handleEditToggle}
                        disabled={saving}
                      >
                        Annuler
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? 'Enregistrement...' : 'Enregistrer'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={handleEditToggle}
                    >
                      Modifier
                    </Button>
                  )}
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Prénom"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    fullWidth
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nom"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    fullWidth
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nom d'utilisateur"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    fullWidth
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <BadgeIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    fullWidth
                    disabled={!editMode}
                    type="email"
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Informations de compte
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Statut du compte
                    </Typography>
                    <Chip
                      label={user.isActive ? 'Actif' : 'Inactif'}
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Dernière connexion
                    </Typography>
                    <Typography variant="body2">
                      {user.lastLogin 
                        ? new Date(user.lastLogin).toLocaleString('fr-FR')
                        : 'Jamais connecté'
                      }
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Permissions
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {user.isAdmin && <Chip label="Administrateur global" color="error" size="small" />}
                      {user.isDepartmentAdmin && <Chip label="Admin département" color="warning" size="small" />}
                      {user.isTeamMember && <Chip label="Membre équipe" color="info" size="small" />}
                      {user.hasDepartmentRights && <Chip label="Droits département" color="primary" size="small" />}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de changement de mot de passe */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockIcon />
          Changer le mot de passe
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl variant="outlined" fullWidth error={!!passwordErrors.currentPassword}>
              <InputLabel>Mot de passe actuel</InputLabel>
              <OutlinedInput
                type={showPassword.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={() => togglePasswordVisibility('current')}>
                      {showPassword.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Mot de passe actuel"
              />
              {passwordErrors.currentPassword && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {passwordErrors.currentPassword}
                </Typography>
              )}
            </FormControl>

            <FormControl variant="outlined" fullWidth error={!!passwordErrors.newPassword}>
              <InputLabel>Nouveau mot de passe</InputLabel>
              <OutlinedInput
                type={showPassword.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={() => togglePasswordVisibility('new')}>
                      {showPassword.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Nouveau mot de passe"
              />
              {passwordErrors.newPassword && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {passwordErrors.newPassword}
                </Typography>
              )}
            </FormControl>

            <FormControl variant="outlined" fullWidth error={!!passwordErrors.confirmPassword}>
              <InputLabel>Confirmer le nouveau mot de passe</InputLabel>
              <OutlinedInput
                type={showPassword.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={() => togglePasswordVisibility('confirm')}>
                      {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Confirmer le nouveau mot de passe"
              />
              {passwordErrors.confirmPassword && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {passwordErrors.confirmPassword}
                </Typography>
              )}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)} disabled={saving}>
            Annuler
          </Button>
          <Button
            onClick={handlePasswordSubmit}
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <KeyIcon />}
          >
            {saving ? 'Modification...' : 'Modifier le mot de passe'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UserProfile 
