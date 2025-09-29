import { chromium, expect } from '@playwright/test';
import { LoginPage } from '../support/pages/login.page';
import * as fs from 'fs';
import * as path from 'path';

interface Role {
  key: string;
  cpf: string | undefined;
  password: string | undefined;
  label: string;
}

// Configuração simplificada dos roles
const ROLES: Role[] = [
  {
    key: 'admin',
    cpf: process.env.ADMIN_CPF,
    password: process.env.ADMIN_PASSWORD,
    label: 'Administrador',
  },
  { key: 'n1', cpf: process.env.N1_CPF, password: process.env.N1_PASSWORD, label: 'Analista N1' },
  { key: 'n2', cpf: process.env.N2_CPF, password: process.env.N2_PASSWORD, label: 'Analista N2' },
  { key: 'n3', cpf: process.env.N3_CPF, password: process.env.N3_PASSWORD, label: 'Supervisor N3' },
  {
    key: 'auditor',
    cpf: process.env.AUDITOR_CPF,
    password: process.env.AUDITOR_PASSWORD,
    label: 'Auditor',
  },
  {
    key: 'agricultor',
    cpf: process.env.AGRICULTOR_CPF,
    password: process.env.AGRICULTOR_PASSWORD,
    label: 'Agricultor',
  },
  { key: 'rtv', cpf: process.env.RTVS_CPF, password: process.env.RTVS_PASSWORD, label: 'RTVs' },
  { key: 'rti', cpf: process.env.RTVI_CPF, password: process.env.RTVI_PASSWORD, label: 'RTVi' },
  { key: 'b2b', cpf: process.env.B2B_CPF, password: process.env.B2B_PASSWORD, label: 'B2B' },
  {
    key: 'avaliador',
    cpf: process.env.AVALIADOR_CPF,
    password: process.env.AVALIADOR_PASSWORD,
    label: 'Avaliador',
  },
  {
    key: 'avaliados_cashback',
    cpf: process.env.AVALIADOR_CASHBACK_CPF,
    password: process.env.AVALIADOR_CASHBACK_PASSWORD,
    label: 'Avaliador Cashback',
  },
  {
    key: 'multiplicador',
    cpf: process.env.MULTIPLICADOR_CPF,
    password: process.env.MULTIPLICADOR_PASSWORD,
    label: 'Multiplicador',
  },
  {
    key: 'distribuidor',
    cpf: process.env.DISTRIBUIDOR_CPF,
    password: process.env.DISTRIBUIDOR_PASSWORD,
    label: 'Distribuidor',
  },
];

async function generateStorageForRole(role: Role) {
  const storagePath = `storage/${role.key}.json`;

  if (fs.existsSync(storagePath)) {
    console.log(`✓ storage já existe: ${storagePath}`);
    return;
  }

  if (!role.cpf || !role.password) {
    console.log(`↷ pulando ${role.key}: credenciais ausentes no .env`);
    return;
  }

  console.log(`→ gerando storage para: ${role.key}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    baseURL: process.env.BASE_URL || 'https://stg.conexaobiotec.com.br',
  });
  const page = await context.newPage();

  const login = new LoginPage(page);
  await login.goto();

  // Garantir que as credenciais existem (já verificamos acima)
  if (role.cpf && role.password) {
    await login.login(role.cpf, role.password);
  } else {
    throw new Error(`Credenciais ausentes para ${role.key}`);
  }

  // Validar login verificando se não estamos mais na página de login
  try {
    await expect(page).not.toHaveURL(/login=true/i, { timeout: 10000 });
    console.log(`✓ Login bem-sucedido para ${role.key}`);
  } catch (error) {
    console.log(`⚠ Aviso: Possível problema no login para ${role.key}, mas continuando...`);
  }

  await context.storageState({ path: storagePath });
  const size = fs.statSync(storagePath).size;
  console.log(`✔ storage salvo: ${role.key} → ${storagePath} (${size} bytes)`);

  await browser.close();
}

export default async function globalSetup() {
  // Garantir que a pasta storage existe
  const storageDir = path.resolve('storage');
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  // Gerar storages para todos os roles
  for (const role of ROLES) {
    await generateStorageForRole(role);
  }
}
