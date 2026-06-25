export const BostaCityMapping = {
  'القاهرة': 'EG-01',
  'الجيزة': 'EG-02',
  'الإسكندرية': 'EG-03',
  'الغربية': 'EG-04',
  'الدقهلية': 'EG-05',
  'الشرقية': 'EG-06',
  'المنوفية': 'EG-07',
  'القليوبية': 'EG-08',
  'البحيرة': 'EG-09',
  'DEFAULT': 'EG-01' 
};

export const getBostaCityCode = (govName) => {
  return BostaCityMapping[govName] || BostaCityMapping['DEFAULT'];
};
