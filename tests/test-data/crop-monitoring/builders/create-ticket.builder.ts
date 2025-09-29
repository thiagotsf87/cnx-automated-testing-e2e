type Grower = { document: string; name: string };

export function buildCreateTicketPayload(grower: Grower) {
  return {
    growers: [grower],
    cropMonitoring: {
      auditJustification: 'OTHERS',
      uf: 'CE',
      growerGroupHarvestArea: {
        potentialArea: 80000,
        '2024/2025': 40000,
      },
      preferredContacts: [
        {
          growerDocument: grower.document,
          contactType: 'PROPRIO',
          contactRole: '',
          contactName: '',
          contactPhone: '11987888776',
        },
        {
          growerDocument: grower.document,
          contactType: 'PROPRIO',
          contactRole: '',
          contactName: '',
          contactPhone: '11987654323',
          contactEmail: 'hebreugroitroce-2887@yopmail.com',
        },
      ],
    },
  };
}
