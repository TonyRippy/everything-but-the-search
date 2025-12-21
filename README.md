# Everything But The Search

A local-first replacment for convenience queries on web search engines.

Modern web search engines have lots of useful features. Increasingly they are
able to answer questions directly, rather than providing links to other sites
that answer your question. These are sometimes called "one box" queries, and 
examples include:

  * [Dictionary lookups](https://www.google.com/search?q=define+exposition)
  * [Solving math problems](https://www.google.com/search?q=x%5E2+-+1+%3D+0&oq=x%5E2+-+1+%3D+)
  * [Graphing functions](https://www.google.com/search?q=sqrt%28x%29)
  * ... and more!

These tools are incredibly useful, but do you really need to go to Google or
Bing to answer them? For a lot of queries, your local browser is more than
powerful enough to answer the question on its own, using Javascript.

The goal is to make it possible to, over time, answer as many of these types
of queries as possible. 

## Why use this tool?

It has several benefits:

  * It's fast!
  * Works offline without a network conneciton.
  * A green solution. While tine, it can save energy that would be otherwise be
    used by the networking and computing infrastructure that serves these 
    requests.

## Installing

TODO

## Development

  * Use the Node version in `.nvmrc` (for example `nvm use`).
  * Install dependencies with `npm install`.
  * Install git hooks once per clone: `npm run hooks:install`.
  * Run `npm test` and `npm run lint` before committing (the pre-commit hook enforces this).
