import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private retryAttempts = 0;
  private readonly maxRetries = 5;
  private readonly retryDelay = 5000; // 5 secondes

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.ensureConnection();
  }

  private async ensureConnection(): Promise<void> {
    try {
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
        this.logger.log('Base de données connectée avec succès');
        this.retryAttempts = 0;
      } else if (!this.dataSource.isConnected) {
        await this.reconnect();
      }
    } catch (error) {
      this.logger.error(`Erreur de connexion à la base de données: ${error.message}`);
      await this.handleConnectionError(error);
    }
  }

  private async reconnect(): Promise<void> {
    try {
      this.logger.log('Tentative de reconnexion à la base de données...');
      await this.dataSource.destroy();
      await this.dataSource.initialize();
      this.logger.log('Reconnexion réussie');
      this.retryAttempts = 0;
    } catch (error) {
      this.logger.error(`Échec de reconnexion: ${error.message}`);
      throw error;
    }
  }

  private async handleConnectionError(error: any): Promise<void> {
    this.retryAttempts++;
    
    if (this.retryAttempts <= this.maxRetries) {
      this.logger.warn(
        `Tentative de reconnexion ${this.retryAttempts}/${this.maxRetries} dans ${this.retryDelay / 1000} secondes...`
      );
      
      await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      await this.ensureConnection();
    } else {
      this.logger.error('Nombre maximum de tentatives de reconnexion atteint');
      throw new Error('Impossible de se connecter à la base de données après plusieurs tentatives');
    }
  }

  async executeQuery<T = any>(query: string, parameters?: any[]): Promise<T> {
    try {
      await this.ensureConnection();
      return await this.dataSource.query(query, parameters);
    } catch (error) {
      this.logger.error(`Erreur lors de l'exécution de la requête: ${error.message}`);
      
      // Si c'est une erreur de connexion, essayer de reconnecter
      if (this.isConnectionError(error)) {
        await this.reconnect();
        return await this.dataSource.query(query, parameters);
      }
      
      throw error;
    }
  }

  private isConnectionError(error: any): boolean {
    const connectionErrorCodes = [
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ER_SERVER_GONE_ERROR',
      'ER_CONNECTION_COUNT_ERROR'
    ];
    
    return connectionErrorCodes.some(code => 
      error.code === code || error.message.includes(code)
    );
  }

  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      await this.ensureConnection();
      await this.dataSource.query('SELECT 1');
      return { status: 'healthy', message: 'Connexion à la base de données active' };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        message: `Erreur de connexion: ${error.message}` 
      };
    }
  }
} 
