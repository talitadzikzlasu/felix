import {Resolver, Mutation, Query, Args, Arg, Int} from 'type-graphql';
import LateRentFlag from './lateRentFlag.entity';
import Tenant from '../tenant/tenant.entity';
import {MarkRentLateArgs, UnmarkRentLateArgs, LateTenantsArgs, IsTenantFleggedLateInPeriodArgs} from './lateRentFlag.dto';

@Resolver(() => LateRentFlag)
export default class LateRentFlagResolver {
  // Mark rent late  manually
  @Mutation(() => Boolean)
  async markRentLate(@Args() data: MarkRentLateArgs): Promise<boolean> {
    await LateRentFlag.upsert({tenantId: data.tenantId, period: data.period, isOn: true}, ['tenantId', 'period']);
    return true;
  }

  // Unmark rent late manually
  @Mutation(() => Boolean)
  async unmarkRentLate(@Args() data: UnmarkRentLateArgs): Promise<boolean> {
    const row = await LateRentFlag.findOne({where: {tenantId: data.tenantId, period: data.period}});
    if (row) {
      row.isOn = false;
      await LateRentFlag.save(row);
    }
    return true;
  }

  // Is tenant marked as late in given period
  @Query(() => Boolean)
  async isTenantFlaggedLateInPeriod(@Args() data: IsTenantFleggedLateInPeriodArgs): Promise<boolean> {
    const period = data.period;
    return LateRentFlag.exists({
      where: {tenantId: data.tenantId, period, isOn: true},
    });
  }

  // List of tenants with manual flag - "Rent is Late" in given period
  @Query(() => [Tenant])
  async lateTenants(@Args() data: LateTenantsArgs): Promise<Tenant[]> {
    const period = data.period;
    const flags = await LateRentFlag.find({where: {period, isOn: true}});
    if (!flags.length) return [];
    const ids = [...new Set(flags.map(f => f.tenantId))];
    return Tenant.createQueryBuilder('t')
      .where('t.id IN (:...ids)', {ids})
      .getMany();
  }

  // ADDITIONAL possibilities with this setup
  // Does tenant have any flagged late payments
  @Query(() => Boolean)
  async isTenantFlaggedLate(@Arg('tenantId', () => Int) tenantId: number): Promise<boolean> {
    return LateRentFlag.exists({where: {tenantId, isOn: true}});
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
