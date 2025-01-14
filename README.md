# syllabase
course requirement explorer for ncsu (maybe unc soon™)

## what it does
- scrapes course data from university sites
- builds a graph database of course requirements
- lets you explore prerequisites/corequisites through web interface
- validates requirements using LLMs to catch weird edge cases
- integrates professor ratings and course history from RMP
- no login needed - just browse and go

## architecture
- frontend: nextjs app (deployed)
- api: express server on ec2
- db: neo4j aura
- local dev environment available for all components

## technical highlights
- reverse engineered + documented RMP's internal GraphQL API (shoutout to their top-tier security team)
- custom LLM pipeline for validating course requirements
- automated scraping + data processing pipeline
- graph-based data modeling for complex course relationships
- efficient prerequisite path finding using cypher
- modular monorepo architecture for easy extension

## structure
```
syllabase/
├── client/         # nextjs frontend w/ shadcn
├── server/         # express + neo4j api
├── rmp/            # professor rating collection
├── data/
│   ├── llm/        # requirement validation
│   ├── professor/  # cleaning up rmp data
│   └── db/         # neo4j pipeline
└── scraper/        # scrapy course collector
```

## known limitations
- requirement parsing can get wonky with non-standard formats (e.g. SAT scores parsed as course numbers)
- assumes department context from url params which usually works but ymmv
- rmp data may be stale - updates on scrape only

## features
### course data
- automatic requirement parsing and validation
- graph-based prerequisite visualization
- department/course search and filtering

### professor data 
- integrated rmp ratings and reviews
- links to original pages to browse reviews
- department-based browsing

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
- feel free to steal all my reverse engineered rmp data and make your own!
