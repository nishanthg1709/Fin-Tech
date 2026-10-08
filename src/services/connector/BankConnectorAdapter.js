/**
 * Bank Connector Interface & Types
 * Defines the contract for all bank-data connectors (Mock Sandbox, Plaid, Open Banking, Account Aggregator).
 */

export class BankConnectorAdapter {
  /**
   * Returns list of supported financial institutions
   * @returns {Promise<Array<{id: string, name: string, logo: string, country: string, type: string}>>}
   */
  async getInstitutions() {
    throw new Error('Method getInstitutions() must be implemented.');
  }

  /**
   * Initiates consent request for the user and financial institution
   * @param {Object} consentRequest
   * @param {string} consentRequest.institutionId
   * @param {Array<string>} consentRequest.scopes - e.g. ['TRANSACTIONS', 'BALANCES', 'PROFILE']
   * @param {string} consentRequest.purpose - e.g. 'Expense & Subscription Optimization'
   * @param {string} consentRequest.duration - e.g. '12_MONTHS'
   * @returns {Promise<{consentArtefactId: string, consentStatus: string, redirectUrl?: string, expiresAt: string}>}
   */
  async requestConsent(consentRequest) {
    throw new Error('Method requestConsent() must be implemented.');
  }

  /**
   * Exchanges authorization / consent token for an authenticated secure session
   * @param {string} consentArtefactId
   * @returns {Promise<{accessToken: string, connectedAccountId: string, institution: Object}>}
   */
  async exchangeConsentToken(consentArtefactId) {
    throw new Error('Method exchangeConsentToken() must be implemented.');
  }

  /**
   * Fetches consented accounts for the connection
   * @param {string} connectionToken
   * @returns {Promise<Array<Object>>}
   */
  async getAccounts(connectionToken) {
    throw new Error('Method getAccounts() must be implemented.');
  }

  /**
   * Fetches transactions for an account within a date range
   * @param {string} connectionToken
   * @param {string} accountId
   * @param {Object} [options]
   * @returns {Promise<Array<Object>>}
   */
  async getTransactions(connectionToken, accountId, options) {
    throw new Error('Method getTransactions() must be implemented.');
  }

  /**
   * Revokes user consent permanently
   * @param {string} connectionToken
   * @returns {Promise<{revoked: boolean}>}
   */
  async revokeConsent(connectionToken) {
    throw new Error('Method revokeConsent() must be implemented.');
  }
}
