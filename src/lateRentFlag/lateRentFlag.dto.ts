import {IsOptional} from 'class-validator';
import {ArgsType, Field, Int} from 'type-graphql';

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
export class IsTenantLateInPeriodArgs {
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
