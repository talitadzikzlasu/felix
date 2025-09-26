import {ArgsType, Field, Int} from 'type-graphql';
import {IsOptional} from 'class-validator';

@ArgsType()
export class MarkRentLateArgs {
  @Field(() => Int)
  tenantId!: number;

  @Field()
  period!: string;
}

@ArgsType()
export class UnmarkRentLateArgs {
  @Field(() => Int)
  tenantId!: number;

  @Field()
  period!: string;
}

@ArgsType()
export class IsTenantFleggedLateInPeriodArgs {
  @Field(() => Int)
  tenantId!: number;

  @Field()
  period!: string;
}

@ArgsType()
export class LateTenantsArgs {
  @Field({nullable: true})
  @IsOptional()
  period?: string;
}
