# syllabase
course requirement explorer for ncsu (maybe unc soon™)

## what it does
- scrapes course data from university sites
- builds a graph database of course requirements
- lets you explore prerequisites/corequisites through web interface
- validates requirements using LLMs to catch weird edge cases
- includes reverse-engineered RMP GraphQL api for future professor rating integration
- no login needed - just browse and go

## architecture
- frontend: nextjs app (deployed)
- api: express server on ec2
- db: neo4j aura
- local dev environment available for all components

## structure
```
syllabase/
├── client/         # nextjs frontend w/ shadcn
├── server/         # express + neo4j api
├── rmp/            # reverse engineered rate my professor api functions + examples
├── data/
│   ├── llm/       # requirement validation
│   └── db/        # neo4j pipeline
└── scraper/       # scrapy course collector
```
## known limitations
- requirement parsing can get wonky with non-standard formats (e.g. SAT scores parsed as course numbers)
- unc support is experimental/untested
- assumes department context from url params which usually works but ymmv
- rmp integration is POC only rn - basic graphql api wrapper exists but not integrated

## rmp api features
- search profs by name
- get detailed ratings/reviews 
- fetch all profs by department
- get department listings
- built-in rate limiting and pagination handling
- basic error handling for failed requests

## local development
1. install deps: neo4j, ollama, node/npm, python3/pip
2. clone & `npm install`
3. update .env with your neo4j aura creds
4. start services: neo4j, ollama
5. run scraper: `cd scraper && scrapy crawl courses`
6. process data: `cd data && node process.js`
7. start server: `cd server && npm run dev`
8. start client: `cd client && npm run dev`
9. open `localhost:3000`

## contributing
idk probably just open a pr if you want. esp interested in:
- better requirement parsing
- support for other universities
- improved validation logic
- actual rmp integration would be cool
