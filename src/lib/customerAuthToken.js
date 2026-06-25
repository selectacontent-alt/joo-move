export function decodeCustomerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    if (!decoded?.id || !decoded?.email) return null;
    const id = Number(decoded.id);
    if (!Number.isInteger(id) || id <= 0) return null;

    return {
      id,
      email: String(decoded.email)
    };
  } catch (error) {
    return null;
  }
}

export function createCustomerToken(customer) {
  return Buffer.from(JSON.stringify({
    id: customer.id,
    email: customer.email
  })).toString('base64');
}

export function toPublicCustomer(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name || '',
    email: row.email || '',
    phone: row.phone || '',
    alt_phone: row.alt_phone || '',
    governorate: row.governorate || '',
    city: row.city || '',
    address: row.address || '',
    apartment: row.apartment || '',
    landmark: row.landmark || '',
    created_at: row.created_at || null,
    updated_at: row.updated_at || null
  };
}

export function cleanCustomerProfile(input = {}) {
  const source = input && typeof input === 'object' ? input : {};
  const trimTo = (value, max) => String(value || '').trim().slice(0, max);

  return {
    name: trimTo(source.name, 255),
    phone: trimTo(source.phone, 50),
    alt_phone: trimTo(source.alt_phone || source.altPhone, 50),
    governorate: trimTo(source.governorate, 255),
    city: trimTo(source.city, 255),
    address: trimTo(source.address, 1000),
    apartment: trimTo(source.apartment, 255),
    landmark: trimTo(source.landmark, 255)
  };
}
