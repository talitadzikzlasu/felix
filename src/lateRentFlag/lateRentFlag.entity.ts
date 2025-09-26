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
} from 'typeorm';
import Tenant from '../tenant/tenant.entity';

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

  @Field()
  @Column()
  createdAt!: Date;

  @Field()
  @Column()
  updatedAt!: Date;

  async getTenant(): Promise<Tenant> {
    const tenant = this.tenant || (await Tenant.findOneOrFail({where: {id: this.tenantId}}));
    this.tenant = tenant;

    return tenant;
  }

  @BeforeInsert()
  @BeforeUpdate()
  validatePeriod(): void {
    // simple check for month: 01-12 and year: 0000 - 9999
    if (this.period || this.period.match(/^(0[1-9]|1[0-2])-\d{4}$/)) {
      throw new Error('Period must be: MM-YYYY');
    }
  }
}

export default LateRentFlag;
