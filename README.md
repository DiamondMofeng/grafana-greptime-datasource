# Greptime Datasource Plugin for Grafana

### TODO List

- [ ] Add Support for time series query
- [ ] Add support for more query protocols. Only Sql is supported now.
- [ ] Drop-down list of fields when querying
- [ ] Find a way to test this plugin
- [ ] Sign this plugin
- [ ] CI/CD
### Commands

1. Install dependencies

   ```bash
   yarn install
   ```

2. Build plugin in development mode or run in watch mode

   ```bash
   yarn dev

   # or

   yarn watch
   ```

3. Build plugin in production mode

   ```bash
   yarn build
   ```

4. Run the tests (using Jest)

   ```bash
   # Runs the tests and watches for changes
   yarn test
   
   # Exists after running all the tests
   yarn lint:ci
   ```

5. Spin up a Grafana instance and run the plugin inside it (using Docker)

   ```bash
   yarn server
   ```

6. Run the linter

   ```bash
   yarn lint
   
   # or

   yarn lint:fix
   ```

