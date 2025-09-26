import Tenant from '../tenant/tenant.entity';

// check if tenant is late with rent in given period
export async function tenantIsSystemLateInPeriod(tenantId: number, period: string): Promise<boolean> {}

// check if tenant is late with rent in any period
export async function tenantIsSystemLate(tenantId: number): Promise<boolean> {}

// for tenant, list all the periods they are late
export async function getLatePeriodsForTenant(tenantId: string): Promise<string[]> {}

// for given period, list me tenants that are late
export async function getLateTenantsForPeriod(period: string): Promise<Tenant[]> {}

// list me all tenats that are late in any period - this may be costly on DB side
export async function getLateTenants(period: string): Promise<Tenant[]> {}
