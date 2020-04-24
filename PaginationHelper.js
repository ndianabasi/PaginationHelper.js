/*
 * PaginationHelper.js
 *
 * (c) Ndianabasi Udonkang <ndianabasi@furnish.ng>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const Env = use('Env');

const BASE_URL = `http://${Env.get('HOST')}${Number(Env.get('PORT')) === 8080 ? '' : ':' + String(Env.get('PORT'))}`;

class PaginationHelper {
  requestURL = null;
  total = null;
  per_page = null;
  current_page = null;
  last_page = null;
  next_page_url = '';
  prev_page_url = null;
  from = null;
  to = null;
  request = null;
  data = null;

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

  /*
   * get the "total" property
   */
  getTotal() {
    return this.total ? this.total : null;
  }

  /*
   * get the "data" property
   */
  getData() {
    if (this.custom_build) {
      return JSON.parse(JSON.stringify(this.result));
    }
    return this.data ? this.data : null;
  }

  /*
   * get the "last_page" property
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

  /*
   * get the "BASE_URL" property
   */
  getBaseURL() {
    return BASE_URL;
  }

  /*
   * get the "per_page" property
   */
  getPerPage() {
    return this.per_page ? this.per_page : null;
  }

  /*
   * get the "API_URL" property
   */
  getAPIURL() {
    const API_URL = this.request.url();
    this.requestURL = API_URL;
    return this.requestURL;
  }

  /*
   * get the "current_page" property
   */
  getCurrentPage() {
    return this.current_page <= 1 ? 1 : this.current_page;
  }

  /*
   * Calculate the "next_page_url" property
   */
  getNextPageURL() {
    const URL =
      this.getLastPage() === this.getCurrentPage()
        ? null
        : `${this.getBaseURL()}${this.getAPIURL()}?page=${this.getCurrentPage() + 1}`;
    this.next_page_url = URL;
    return this.next_page_url;
  }

  /*
   * Calculate the "prev_page_url" property
   */
  getPrevPageURL() {
    const URL =
      this.getCurrentPage() === 1 ? null : `${this.getBaseURL()}${this.getAPIURL()}?page=${this.getCurrentPage() - 1}`;
    this.prev_page_url = URL;
    return this.prev_page_url;
  }

  /*
   * Calculate the "from" property
   */
  getFrom() {
    const fromNum = this.getCurrentPage() === 1 ? 1 : this.getPerPage() * (this.getCurrentPage() - 1) + 1;
    this.from = fromNum;
    return this.from;
  }

  /*
   * Calculate the "to" property
   */
  getTo() {
    const toNum = this.getPerPage() * this.getCurrentPage();
    this.to = toNum;
    return this.to;
  }

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
