/*
 * PaginationHelper.js
 *
 * (c) Ndianabasi Udonkang <ndianabasi@furnish.ng>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

/** @typedef {import('@adonisjs/framework/src/Env')} Env */
const Env = use('Env');

/**
 * The Base URL obtained from the backend's `.env` file.
 * @const BASE_URL
 */
const BASE_URL = `http://${Env.get('HOST')}${Number(Env.get('PORT')) === 8080 ? '' : ':' + String(Env.get('PORT'))}`;

/**
 * A Pagination Helper written in Vanilla Javascript.
 * Made for Adonis.js but can be used by any other Javascript library.
 *
 * @class PaginationHelper class
 */
class PaginationHelper {
  /**
   *
   * @param {object} result A JSON object from `Query Builder`'s
   * paginate function or raw query result from `Database` class.
   * @param {object} request The request object from the controller
   * method's `ctx` object.
   * @param {{custom_build}} custom_build_ctx The custom build context
   * object used to indicate if result came from `Query Builder`'s
   * paginate function or raw query from `Database` class.
   * @param {boolean} custom_build_ctx.custom_build A boolean to indicate
   * whether the pagination data should be build from scratch or to use
   * that from `Query Builder`'s paginate function as reference.
   * @param {number} per_page The number of result per page. Optionally if `custom_build === false`
   * @param {number} page The current page of the query. Optionally if `custom_build === false`
   * @param {number} total The total number of items in the query. Optionally if `custom_build === false`
   * @returns Object
   */
  constructor(result, request, { custom_build }, per_page, page, total) {
    this.total = Number(result.total) || total;
    this.per_page = Number(result.perPage) || Number(per_page);
    this.current_page = Number(result.page) || Number(page);
    this.last_page = Number(result.lastPage);
    this.request = request;
    this.result = result;
    this.data = result.data;
    this.custom_build = custom_build;
  }

  /**
   * Get the "total" property
   * @method getTotal
   * @returns {number} The total number of items in the query
   */
  getTotal() {
    return this.total ? this.total : null;
  }

  /**
   * Get the "data" property
   * @method getData
   * @returns {object} The query data to be appended to the pagination data.
   *
   */
  getData() {
    if (this.custom_build) {
      return JSON.parse(JSON.stringify(this.result));
    }
    return this.data ? this.data : null;
  }

  /**
   * Get the "last_page" property
   * @method getLastPage
   * @returns {number} The last page of the current query data.
   */
  getLastPage() {
    if (this.custom_build) {
      const fullPages = Math.floor(this.getTotal() / this.getPerPage());

      const remainderPage = this.getTotal() % this.getPerPage();

      let lastPage;
      remainderPage ? (lastPage = fullPages + 1) : (lastPage = fullPages);

      return lastPage;
    } else return this.last_page;
  }

  /**
   * Get the "BASE_URL" property
   * @method getBaseURL
   * @returns {string} The base URL to be appended to the
   */
  getBaseURL() {
    return BASE_URL;
  }

  /**
   * Get the "BASE_URL" property
   * @method getBaseURL
   * @returns {string} The base URL to be appended to the
   */
  getBaseURL() {
    return BASE_URL;
  }

  /**
   * Get the "per_page" property
   * @method getPerPage
   * @returns {number} The current number of results per query.
   */
  getPerPage() {
    return this.per_page ? this.per_page : null;
  }

  /**
   * Get the "API_URL" property
   * @method getAPIURL
   * @returns {string} The current request URL with query strings
   */
  getAPIURL() {
    const API_URL = this.request.originalUrl();
    this.requestURL = API_URL;
    return this.requestURL;
  }

  /**
   * Updates the supplied Query String paramaters in the API URL
   *
   * Adapted from
   * {@link https://stackoverflow.com/a/6021027/4040835|How can I add or update a query string parameter? - Stack Overflow}
   *
   * @param {string} uri The API URI
   * @param {{key: string, value: number}} queryStringObject An object
   * containing the query string key and its corresponding value
   * to be updated.
   *
   * @returns {string} Updated API URI
   */
  updateQS(uri, { key, value }) {
    const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
    var separator = uri.indexOf('?') !== -1 ? '&' : '?';
    if (uri.match(re)) {
      return uri.replace(re, '$1' + key + '=' + value + '$2');
    } else {
      return uri + separator + key + '=' + value;
    }
  }

  /**
   * Get the "current_page" property
   * @method getCurrentPage
   * @returns {number} The current page of the query.
   */
  getCurrentPage() {
    return this.current_page <= 1 ? 1 : this.current_page;
  }

  /**
   * Calculate the "next_page_url" property
   * @method getNextPageURL
   * @returns {string} The next page URL of the query.
   */
  getNextPageURL() {
    const URL =
      this.getLastPage() === this.getCurrentPage()
        ? null
        : `${this.getBaseURL()}${this.updateQS(this.getAPIURL(), { key: 'page', value: this.getCurrentPage() + 1 })}`;

    this.next_page_url = URL;
    return this.next_page_url;
  }

  /**
   * Calculate the `this.prev_page_url` property
   * @method getPrevPageURL
   * @returns {string} The previous page URL of the query.
   */
  getPrevPageURL() {
    const URL =
      this.getCurrentPage() === 1
        ? null
        : `${this.getBaseURL()}${this.updateQS(this.getAPIURL(), { key: 'page', value: this.getCurrentPage() - 1 })}`;

    this.prev_page_url = URL;
    return this.prev_page_url;
  }

  /**
   * Calculate the `this.from` property
   * @method getFrom
   * @returns {number} The `this.from` property.
   */
  getFrom() {
    const fromNum = this.getCurrentPage() === 1 ? 1 : this.getPerPage() * (this.getCurrentPage() - 1) + 1;
    this.from = fromNum;
    return this.from;
  }

  /**
   * Calculate the `this.to` property
   * @method getTo
   * @returns {number} The `this.to` property.
   */
  getTo() {
    const toNum = this.getPerPage() * this.getCurrentPage();
    this.to = toNum;
    return this.to;
  }

  /**
   * The `paginate` getter which is used as the public method for this class.
   * It collates and returns the modified pagination data.
   *
   * @method paginate
   * @returns {{total: number, per_page: number, current_page: number, last_page: number, next_page_url: string, prev_page_url: string, from: number, to: number, data: Array.<object>}}
   *
   */
  get paginate() {
    return {
      total: this.getTotal(),
      per_page: this.getPerPage(),
      current_page: this.getCurrentPage(),
      last_page: this.getLastPage(),
      next_page_url: this.getNextPageURL(),
      prev_page_url: this.getPrevPageURL(),
      from: this.getFrom(),
      to: this.getTo(),
      data: this.getData(),
    };
  }
}

module.exports = PaginationHelper;
