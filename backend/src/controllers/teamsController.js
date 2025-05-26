const Team = require('../models/Team');
const sequelize = require('../config/database');
const { Site } = require('../models');

const teamsController = {
  // Récupérer toutes les équipes
  getAll: async (req, res) => {
    try {
      const teams = await Team.findAll({
        include: [{
          model: Site,
          as: 'sites',
          attributes: ['id', 'name']
        }]
      });
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Récupérer une équipe par ID
  getById: async (req, res) => {
    try {
      const team = await Team.findByPk(req.params.id, {
        include: [{
          model: Site,
          as: 'sites',
          attributes: ['id', 'name']
        }]
      });
      
      if (!team) {
        return res.status(404).json({ message: 'Équipe non trouvée' });
      }
      
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Créer une nouvelle équipe
  create: async (req, res) => {
    try {
      const team = await Team.create(req.body);
      res.status(201).json(team);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Mettre à jour une équipe
  update: async (req, res) => {
    try {
      const team = await Team.findByPk(req.params.id);
      if (!team) {
        return res.status(404).json({ message: 'Équipe non trouvée' });
      }
      
      await team.update(req.body);
      res.json(team);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Supprimer une équipe
  delete: async (req, res) => {
    try {
      const team = await Team.findByPk(req.params.id);
      if (!team) {
        return res.status(404).json({ message: 'Équipe non trouvée' });
      }
      
      await team.destroy();
      res.json({ message: 'Équipe supprimée avec succès' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Assigner une équipe à un site
  assignToSite: async (req, res) => {
    try {
      const teamId = req.params.teamId;
      const siteId = req.params.siteId;
      
      const team = await Team.findByPk(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Équipe non trouvée' });
      }
      
      const site = await Site.findByPk(siteId);
      if (!site) {
        return res.status(404).json({ message: 'Site non trouvé' });
      }
      
      await team.addSite(site);
      res.json({ message: `Équipe ${teamId} assignée au site ${siteId} avec succès` });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Retirer une équipe d'un site
  removeFromSite: async (req, res) => {
    try {
      const teamId = req.params.teamId;
      const siteId = req.params.siteId;
      
      const team = await Team.findByPk(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Équipe non trouvée' });
      }
      
      const site = await Site.findByPk(siteId);
      if (!site) {
        return res.status(404).json({ message: 'Site non trouvé' });
      }
      
      await team.removeSite(site);
      res.json({ message: `Équipe ${teamId} retirée du site ${siteId} avec succès` });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Statistiques des équipes
  getStatistics: async (req, res) => {
    try {
      const totalTeams = await Team.count();
      
      const totalMembers = await Team.sum('members');
      
      const averageMembers = totalMembers / totalTeams || 0;
      
      const departmentStats = await Team.findAll({
        attributes: [
          'department',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('members')), 'totalMembers']
        ],
        group: ['department']
      });
      
      res.json({
        total: totalTeams,
        totalMembers,
        averageMembers: Math.round(averageMembers * 100) / 100,
        byDepartment: departmentStats.reduce((acc, curr) => {
          acc[curr.department] = {
            count: curr.dataValues.count,
            members: curr.dataValues.totalMembers
          };
          return acc;
        }, {})
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = teamsController; 