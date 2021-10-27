# optimade changelog

## 2.0

- Add new `npm run prefetch` logic in prefetch.js to check provider avialability,
  cache provider pagination limits in `provider.attributes.query_limits`,
  introduce the sorted and structured providers.json (as source) and prefetched.json (as cache)
- Add new arguments `getStructures(providerId, filter, page, limit)` for pagination
  and pagination limits
- Add new logic for catching errors like
  `Error: messageFromProvider { response: { errors, meta } }`

## 1.2.1

- Fix providers prefetching

## 1.2.0

- Make batch data aggregation is optional to support per-provider progressive data receiving

## 1.1.5

- Add http request timeout

## 1.0.0

- First release
