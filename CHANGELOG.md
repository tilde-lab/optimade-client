# optimade changelog

## 2.0

- Added new `npm run prefetch` logic in prefetch.js - check provider
  avialability, check & response provider limits as array of numbers in
  `provider.attributes.query_limits`, output sorted & structured synchroniously
  providers.json as source & prefetched.json as working cache
- Added new arguments `getStructures(providerId, filter, page, limit)` for
  pageble & limitted requests
- Added logic for catching & response providers truly errors like
  `Error: messageFromProvider { response: { errors, meta } }`

## 1.2.1

- Fix providers prefetching

## 1.2.0

- Make batch data aggregation is optional to support per-provider progressive
  data receiving

## 1.1.5

- Add http request timeout

## 1.0.0

- First release
