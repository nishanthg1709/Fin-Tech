/**
 * Mock / Sandbox Bank Connector
 * Simulates secure Open Banking / Account Aggregator flow for Indian financial institutions.
 * Strictly avoids collecting banking credentials.
 */

import { BankConnectorAdapter } from './BankConnectorAdapter.js';
import { INSTITUTIONS, DEMO_TRANSACTIONS } from '../../data/presetPersonas.js';

export class MockSandboxConnector extends BankConnectorAdapter {
  constructor() {
    super();
    this.consents = new Map();
    this.activeConnections = new Map();
  }

  async getInstitutions() {
    await new Promise(r => setTimeout(r, 150));
    return INSTITUTIONS;
  }

  async requestConsent(consentRequest) {
    await new Promise(r => setTimeout(r, 250));
    const { institutionId, scopes = ['TRANSACTIONS', 'BALANCES'], purpose } = consentRequest;
    const institution = INSTITUTIONS.find(i => i.id === institutionId) || INSTITUTIONS[0];

    const consentArtefactId = `consent_art_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
    const cryptoHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const consentArtefact = {
      consentArtefactId,
      cryptoHash,
      status: 'CONSENTED',
      dataConsumer: 'Smart Expense & Subscriptions Manager',
      financialDataProvider: institution.name,
      institutionId: institution.id,
      institutionBadge: 'Verified Institution',
      scopes,
      purpose: purpose || 'Recurring payment detection, price-change detection, and cash-flow forecasting',
      dataAccessMode: 'READ_ONLY',
      securityProtocol: 'Account Aggregator Protocol + Read-Only Tokenization',
      credentialsStored: 'NONE (Zero-Credential Architecture)',
      createdAt: new Date().toISOString(),
      expiresAt: expiryDate.toISOString(),
      revocableAnytime: true
    };

    this.consents.set(consentArtefactId, consentArtefact);
    return consentArtefact;
  }

  async exchangeConsentToken(consentArtefactId) {
    await new Promise(r => setTimeout(r, 200));
    const consent = this.consents.get(consentArtefactId);
    if (!consent) {
      throw new Error(`Consent artefact ${consentArtefactId} not found.`);
    }

    const connectionToken = `tok_sandbox_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
    const connection = {
      connectionToken,
      consentArtefactId,
      institutionId: consent.institutionId,
      connectedAt: new Date().toISOString()
    };

    this.activeConnections.set(connectionToken, connection);
    return {
      connectionToken,
      consent
    };
  }

  async getAccounts(connectionToken, institutionId = 'hdfc') {
    await new Promise(r => setTimeout(r, 150));
    const inst = INSTITUTIONS.find(i => i.id === institutionId) || INSTITUTIONS[0];

    return [
      {
        accountId: `acc_${inst.id}_4920`,
        accountName: 'Savings Account',
        accountNumber: '•••• 4920',
        currency: 'INR',
        balance: inst.initialBalance,
        availableBalance: inst.initialBalance,
        type: 'SAVINGS',
        institution: inst.name,
        status: 'ACTIVE'
      }
    ];
  }

  async getTransactions(connectionToken) {
    await new Promise(r => setTimeout(r, 200));
    return DEMO_TRANSACTIONS;
  }

  async revokeConsent(consentArtefactId) {
    await new Promise(r => setTimeout(r, 100));
    this.consents.delete(consentArtefactId);
    return { revoked: true, timestamp: new Date().toISOString() };
  }
}

export const sandboxConnector = new MockSandboxConnector();
