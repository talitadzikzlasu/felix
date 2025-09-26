import {Resolver, Mutation, Query, Args, Arg, Int} from 'type-graphql';
import Tenant from '../tenant/tenant.entity';
import {MarkRentLateArgs, UnmarkRentLateArgs, LateTenantsArgs, IsTenantLateInPeriodArgs} from './lateRentFlag.dto';
import LateRentFlag from './lateRentFlag.entity';
import LATE_RENT_FLAG_ERRORS from './lateRentFlag.errors';
import {hasLeaseOverlap} from './lateRentFlag.util';
@Resolver(() => LateRentFlag)
export default class LateRentFlagResolver {
  // Mark rent late
  @Mutation(() => Boolean)
  async markRentLate(@Args() data: MarkRentLateArgs): Promise<boolean> {
    const overlaps = await hasLeaseOverlap(data.tenantId, data.period);
    if (!overlaps) {
      throw new Error(LATE_RENT_FLAG_ERRORS.NO_LEASE_OVERLAP);
    }

    await LateRentFlag.upsert({tenantId: data.tenantId, period: data.period, isOn: true}, ['tenantId', 'period']);

    return true;
  }

  // Unmark rent late
  @Mutation(() => Boolean)
  async unmarkRentLate(@Args() data: UnmarkRentLateArgs): Promise<boolean> {
    const row = await LateRentFlag.findOne({where: {tenantId: data.tenantId, period: data.period}});
    if (row) {
      row.isOn = false;
      await LateRentFlag.save(row);
    }

    return true;
  }

  // Does tenant have any flagged late payments
  @Query(() => Boolean)
  async isTenantFlaggedLate(@Arg('tenantId', () => Int) tenantId: number): Promise<boolean> {
    return LateRentFlag.exists({where: {tenantId, isOn: true}});
  }

  // Is tenant marked as late in given period
  @Query(() => Boolean)
  async isTenantLateInPeriod(@Args() data: IsTenantLateInPeriodArgs): Promise<boolean> {
    const {period, tenantId} = data;

    return LateRentFlag.exists({where: {tenantId, period, isOn: true}});
  }

  // List of tenants late with rent in given period
  @Query(() => [Tenant])
  async lateTenants(@Args() data: LateTenantsArgs): Promise<Tenant[]> {
    const {period} = data;

    const flags = await LateRentFlag.find({where: {period, isOn: true}});
    if (!flags.length) return [];
    const ids = [...new Set(flags.map(f => f.tenantId))];

    return Tenant.createQueryBuilder('t')
      .where('t.id IN (:...ids)', {ids})
      .getMany();
  }

  // List of all periods where tenant is marked as late.
  @Query(() => [String])
  async tenantFlaggedLatePeriods(@Arg('tenantId', () => Int) tenantId: number): Promise<string[]> {
    const rows = await LateRentFlag.find({
      where: {tenantId, isOn: true},
      select: {period: true},
    });
    // TODO: add sorting periods

    return rows.map(r => r.period);
  }
}
