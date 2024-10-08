import React, { useEffect, useState } from 'react';
import { db } from '../firebase-config';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import styles from '../assets/CSS/ACEODashboard.module.css';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Container, Typography, CircularProgress, Modal, Box, TextField, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CEODashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false); // New state for saving
  const navigate = useNavigate();
  const ceoId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'Users'));
        const usersList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const filteredUsers = usersList.filter((user) => user.organizationId === ceoId);
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs :', error);
        toast.error('Échec du chargement des utilisateurs.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [ceoId]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await deleteDoc(doc(db, 'Users', userId));
        setUsers(users.filter(user => user.id !== userId));
        toast.success('Utilisateur supprimé avec succès.');
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur :', error);
        toast.error('Échec de la suppression de l\'utilisateur.');
      }
    }
  };

  const handleModalClose = () => {
    setOpen(false);
    setSelectedUser(null);
    setIsSaving(false); // Reset saving state
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    if (!selectedUser) return;
    setIsSaving(true); // Start saving
    try {
      const userRef = doc(db, 'Users', selectedUser.id);
      await updateDoc(userRef, {
        fullName: selectedUser.fullName,
        username: selectedUser.username,
      });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUser.id ? selectedUser : user
        )
      );
      toast.success('Utilisateur mis à jour avec succès.');
      handleModalClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
      toast.error('Échec de la mise à jour de l\'utilisateur.');
    } finally {
      setIsSaving(false); // End saving
    }
  };

  return (
    <Container className={styles.dashboardContainer}>
      <Typography variant="h4" align="center" gutterBottom>
        Tableau de Bord du PDG
      </Typography>
      {loading ? (
        <CircularProgress className={styles.loader} />
      ) : (
        <Table className={styles.userTable}>
          <TableHead>
            <TableRow>
              <TableCell>Nom Complet</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell>Nom d'utilisateur</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEdit(user)}
                    className={styles.actionButton}
                  >
                    Éditer
                  </Button> &nbsp;
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDelete(user.id)}
                    className={styles.actionButton}
                  >
                    Supprimer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
  
      <Modal
        open={open}
        onClose={handleModalClose}
        aria-labelledby="edit-user-modal"
        aria-describedby="edit-user-modal-description"
        className={styles.modalBackdrop}
      >
        <Box className={styles.modalBox}>
          <IconButton onClick={handleModalClose} className={styles.closeButton} style={{ position: 'absolute', top: 16, left: 16 }}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h5" id="edit-user-modal-title" className={styles.modalTitle} style={{ marginTop: '48px' }}>
            Modifier les Détails de l'Utilisateur
          </Typography>
          {selectedUser && (
            <>
              <TextField
                label="Nom Complet"
                name="fullName"
                value={selectedUser.fullName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                className={styles.inputField}
              />
              <TextField
                label="Email"
                name="email"
                value={selectedUser.email}
                fullWidth
                margin="normal"
                disabled
                className={styles.inputField}
              />
              <TextField
                label="Rôle"
                name="role"
                value={selectedUser.role}
                fullWidth
                margin="normal"
                disabled
                className={styles.inputField}
              />
              <TextField
                label="Nom d'utilisateur"
                name="username"
                value={selectedUser.username}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                className={styles.inputField}
              />
              <Box display="flex" justifyContent="flex-end" mt={3}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveChanges}
                  className={styles.saveButton}
                  disabled={isSaving}
                >
                  {isSaving ? <CircularProgress size={24} /> : 'Sauvegarder les Modifications'}
                </Button> &nbsp;
                <Button variant="contained" color="default" onClick={handleModalClose} className={styles.cancelButton}>
                  Annuler
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
  
      <ToastContainer />
    </Container>
  );
};

export default CEODashboard;
