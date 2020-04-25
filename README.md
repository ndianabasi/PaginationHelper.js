# PaginationHelper.js
A Pagination Helper written in Vanilla Javascript. Made for Adonis.js but can be used by any other Javascript library.

## PROBLEM BACKGROUND
1. The `paginate` function in Adonis.js does not work well when used on queries performed on the `Database` class.
2. From my own frontend needs where I have to render results on a table, the built-in pagination data from the `paginate` function is not sufficient.
3. Typically, the default Adonis.js pagination data looks like this:

```
{
  total: '',
  perPage: '',
  lastPage: '',
  page: '',
  data: [{...}]
}

```
4. I needed to preserve all the keys in query string in the API URL

## SOLUTION:
1. This PaginationHelper class adds additional properties to the pagination data. The pagination data from this class looks like this:
```
{
  total: '',
  per_page: '',
  current_page: '',
  last_page: '',
  next_page_url: '',
  prev_page_url: ''
  from: '',
  to: '',
  data: [{...}]
}

```
2. This PaginationHelper class ensures that you can obtain accurate pagination data from queries on the `Database` class. When used with the `Database` class, you will have to make some changes inside your code. Instructions are below.

## API

The class exposes the `paginate` getter which returns the pagination data.

```
PaginationHelper(result, request, { custom_build }).paginate

// or

PaginationHelper(result, request, { custom_build }, per_page, page, total).paginate
```

### PaginationHelper

- type: `Class`
- params:
    - **result**: `Object` --- A JSON object from `Query Builder`'s paginate function or raw query result from `Database` class.
    - **request**: `Request` --- The request object from the controller method's `ctx` object.
    - **custom_build**: `Object` --- The custom build context object used to indicate if result came from `Query Builder`'s paginate function or raw query from `Database` class.
    - **per_page**: `Number` --- The number of result per page. Optionally if `custom_build === false`
    - **page**: `Number` --- The current page of the query. Optionally if `custom_build === false`
    - **total**: `Number` --- The total number of items in the query. Optionally if `custom_build === false`


### paginate

- type: `Function`

- returns: `Object`

## HOW TO USE

### USE CASE 1: With `Lucid Models`.



When paginating with queries on the Adonis.js `Lucid Models`, instantiate `PaginationHelper` and call the `paginate` method before returning the response. The data in your response should be the output of the `PaginationHelper`'s `paginate` method. Please note that you have to serialise the query result into JSON format before using it to instantiate `PaginationHelper`.

#### To instantiate the PaginationHelper for this use case, use this format:
```javascript
new PaginationHelper(result, request, { custom_build: false }).paginate
```

Make sure you set `custom_build` to `false`.

#### Example code:

```javascript
const PaginationHelper = use('App/Helpers/PaginationHelper');
const Visitor = use('App/Models/Visitor')

class VisitorController {
  async index ({ request, response, view, auth }) {

    // `page` and `per_page` should be sent from your request.
    const { page, per_page } = request.get();
    // or
    //const { page, per_page } = request.post();
  
    // This is the default paginate method
    let visitorRecords = await Visitor.query()
      .select(
        'visitors.id',
        'visitors.first_name',
        'visitors.middle_name',
        'visitors.last_name',
      ).paginate(page, per_page);
    
    // Ensure that you serialise your query result before passing it 
    // into `PaginationHelper`
    visitorRecords = visitorRecords.toJSON();
    
    // Ensure that you set `custom_build` to `false` when you are not querying from the Database class. 
    // Instantiate `PaginationHelper` and call the `paginate` method.
    visitorRecords = new PaginationHelper(visitorRecords, request, { custom_build: false }).paginate;
    
    return response.status(200).json({
      message: 'Query successful',
      data: visitorRecords,
    });
  }
}
```

### USE CASE 2: With `Database` class

Using the PaginationHelper with the `Database` class is a litle bit more involving. But I will explain all what you need to do to get it right. This isn't plug-and-play like the first use case.

#### To instantiate the PaginationHelper for this use case, use this format:
```javascript
new PaginationHelper(result, request, { custom_build: true }, per_page, page, total).paginate
```

Make sure you set `custom_build` to `true`.

#### Example code:

```javascript
const PaginationHelper = use('App/Helpers/PaginationHelper');
const Ministry = use('App/Models/Ministry')

class MinistryController {
  async index({ request, response, view, auth }) {
    // `page` and `per_page` should be sent from your request.
    const { page, per_page } = request.get();
    // or
    //const { page, per_page } = request.post();
    
    // 1. Make sure that you manually call the `limit` and `offset` functions on your queries.
    // See the end of this subquery
    const subquery = Database.from('ministries')
    .select(
      Database.raw(
          'ministries.id, 
          ministries.name as ministry_name, 
          ministries.code, 
          concat(up_1.first_name, " ", up_1.last_name) as deacon_in_charge, 
          concat(up_2.first_name, " ", up_2.last_name) as minister_in_charge, 
          ministries.created_at, 
          ministries.updated_at, 
          organisations.name as organisation'
        ))
        .leftJoin('organisations', 'ministries.organisation_id', 'organisations.id')
        .leftJoin('user_profiles as up_1', 'ministries.deacon_in_charge', 'up_1.user_id')
        .leftJoin('user_profiles as up_2', 'ministries.minister_in_charge', 'up_2.user_id')
        .groupBy('ministries.id');
        .limit(per_page)
        .offset((page - 1) * per_page)
        
        // 2. Make sure that you get the total. If your controller has search functionality,
        // ensure that you recount the total of the filtered result and store in the `total` variable.
        let total = await subquery.getCount();
        
        // 3. For this use case, calling the `toJSON` function won't work on 
        // the Database query result. The `PaginationHelper` class will internally
        // serialise the result to JSON.
        // 4. Ensure that you set `custom_build` to `true` when you are 
        // querying from the `Database` class.
        // 5. Pass in `per_page`, `page`, and `total` params too.
        ministryRecords = new PaginationHelper(
          ministryRecords, 
          request, 
          { custom_build: true }, 
          per_page, 
          page, 
          total).paginate;
        
        return response.status(200).json({
          message: 'Query successful',
          data: ministryRecords,
          status: 200,
          statusText: 'OK',
        });
      }
    }
```

I will be glad to hear your comments and feedback from your use of this Helper. Thank you.

## Contributions

Contributions are welcomed.

## Licence

PaginationHelper.js is open-sourced software and licensed under the [MIT License](http://opensource.org/licenses/MIT). 
