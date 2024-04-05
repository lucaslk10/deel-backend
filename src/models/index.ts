import { DataTypes, Model, Optional } from 'sequelize';
import { DB } from '@database';
import { ContractInterface } from '@/interfaces/contract.interface';
import { ProfileInterface } from '@/interfaces/profile.interface';
import { JobInterface } from '@/interfaces/job.interface';

const sequelize = DB.sequelize;

export type ProfileCreationAttributes = Optional<ProfileInterface, 'id'>;
class Profile extends Model<ProfileInterface, ProfileCreationAttributes> implements ProfileInterface {
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public profession!: string;
  public balance!: number;
  public type!: 'client' | 'contractor';

  // Timestamps
  public readonly createdAt!: string;
  public readonly updatedAt!: string;
}

Profile.init(
  {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profession: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
    },
    type: {
      type: DataTypes.ENUM('client', 'contractor'),
    },
  },
  {
    sequelize,
    modelName: 'Profile',
  },
);

export type ContractCreationAttributes = Optional<ContractInterface, 'id'>;
class Contract extends Model<ContractInterface, ContractCreationAttributes> implements ContractInterface {
  public id?: number; // Non-optional attributes are marked with '!'
  public terms: string;
  public status: 'new' | 'in_progress' | 'terminated';
  ContractorId?: number;

  // Timestamps
  public readonly createdAt!: string;
  public readonly updatedAt!: string;
}

Contract.init(
  {
    terms: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('new', 'in_progress', 'terminated'),
    },
  },
  {
    sequelize,
    modelName: 'Contract',
  },
);

export type JobCreationAttributes = Optional<JobInterface, 'id'>;
class Job extends Model<JobInterface, JobCreationAttributes> implements JobInterface {
  public id?: number;
  public description: string;
  public price: number;
  public paid: boolean;
  public paymentDate: string;
  public ContractId?: number;
  // Timestamps
  public readonly createdAt!: string;
  public readonly updatedAt!: string;
}

Job.init(
  {
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    paid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    paymentDate: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'Job',
  },
);

Profile.hasMany(Contract, { as: 'Contractor', foreignKey: 'ContractorId' });
Contract.belongsTo(Profile, { as: 'Contractor' });
Profile.hasMany(Contract, { as: 'Client', foreignKey: 'ClientId' });
Contract.belongsTo(Profile, { as: 'Client' });
Contract.hasMany(Job);
Job.belongsTo(Contract);

export { sequelize, Profile, Contract, Job };
