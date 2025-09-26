import Tenant from '../../tenant/tenant.entity';
import LateRentFlag from '../lateRentFlag.entity';
import LateRentFlagResolver from '../lateRentFlag.resolver';

describe('LateRentFlagResolver (smoke tests)', () => {
  let resolver: LateRentFlagResolver;

  beforeEach(() => {
    resolver = new LateRentFlagResolver();
    jest.restoreAllMocks();
  });

  it('markRentLate -> calls upsert and returns true', async () => {
    const upsert = jest.spyOn(LateRentFlag, 'upsert').mockResolvedValue({} as any);

    const ok = await resolver.markRentLate({tenantId: 1, period: '09-2025'} as any);

    expect(ok).toBe(true);
    expect(upsert).toHaveBeenCalledWith({tenantId: 1, period: '09-2025', isOn: true}, ['tenantId', 'period']);
  });

  it('unmarkRentLate -> saves when row exists and returns true', async () => {
    const row = {isOn: true} as any;
    jest.spyOn(LateRentFlag, 'findOne').mockResolvedValue(row);
    const save = jest.spyOn(LateRentFlag, 'save').mockResolvedValue({} as any);

    const ok = await resolver.unmarkRentLate({tenantId: 2, period: '08-2025'} as any);

    expect(ok).toBe(true);
    expect(save).toHaveBeenCalledWith(row);
    expect(row.isOn).toBe(false);
  });

  it('isTenantLateInPeriod -> proxies LateRentFlag.exists', async () => {
    const exists = jest.spyOn(LateRentFlag, 'exists').mockResolvedValue(true as any);

    const ok = await resolver.isTenantLateInPeriod({tenantId: 3, period: '07-2025'} as any);

    expect(ok).toBe(true);
    expect(exists).toHaveBeenCalledWith({
      where: {tenantId: 3, period: '07-2025', isOn: true},
    });
  });

  it('lateTenants -> returns [] when no flags', async () => {
    jest.spyOn(LateRentFlag, 'find').mockResolvedValue([]);
    // stub QB chain for completeness (won't be called here)
    jest.spyOn(Tenant, 'createQueryBuilder').mockReturnValue({
      where: () => ({getMany: async () => []}),
    } as any);

    const res = await resolver.lateTenants({period: '09-2025'} as any);

    expect(res).toEqual([]);
  });
});
