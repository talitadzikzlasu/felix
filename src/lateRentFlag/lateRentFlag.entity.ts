import {ObjectType, Field, Int} from 'type-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Relation,
  ManyToOne,
  BeforeInsert,
  BeforeUpdate,
  Unique,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import Tenant from '../tenant/tenant.entity';
import LATE_RENT_FLAG_ERRORS from './lateRentFlag.errors';

@ObjectType()
@Entity()
@Unique(['tenantId', 'period'])
class LateRentFlag extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  /* Belongs to tenant */
  @ManyToOne(() => Tenant, {nullable: false, onDelete: 'CASCADE'})
  @JoinColumn({name: 'tenantId'})
  private tenant?: Relation<Tenant> | null;

  @Column()
  tenantId!: number;

  /* String in format: MM-YYYY */
  @Field()
  @Column()
  period!: string;

  /* The flag is on -> rent is late. */

  @Field()
  @Column({default: true})
  isOn!: boolean;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt!: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  validatePeriod(): void {
    // simple check for month: 01-12 and year: 0000 - 9999
    if (!this.period || !/^(0[1-9]|1[0-2])-\d{4}$/.test(this.period)) {
      throw new Error(LATE_RENT_FLAG_ERRORS.WRONG_PERIOD_FORMAT);
    }
  }
}

export default LateRentFlag;
