import Lease from '../lease/lease.entity';

function getStartEnd(period: string) {
  const [mm, yyyy] = period.split('-').map(Number);
  const start = new Date(yyyy, mm - 1, 1, 0, 0, 0, 0);
  const end = new Date(yyyy, mm, 0, 23, 59, 59, 999);

  return {start, end};
}

export async function hasLeaseOverlap(tenantId: number, period: string) {
  const {start, end} = getStartEnd(period);

  const qb = Lease.createQueryBuilder('l')
    .where('l.tenantId = :tenantId', {tenantId})
    .andWhere('l.start <= :end', {end})
    .andWhere('(l.end IS NULL OR l.end >= :start)', {start})
    .limit(1);

  return !!(await qb.getOne());
}
