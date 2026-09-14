# Project Details

This is a astrology related software project written in latest angular tech stack.

## Coding guidelines for project

- No server-side rendering
- All the code written / generated should be properly readable.
- Components should follow atomic design pattern where smallest component fall under `atoms`, followed by `molecules` followed by `organisms`.
- All the reusable components will stay in `src/app/shared/ui` folder [All the atomic components will stay here].
- All the utilities, if any, should stay in `src/app/shared/utils` folder.
- All the global services, if any, should stay in `src/app/shared/services` folder.
- All the featured components will stay in `src/app/features` folder.
- All the components that are mapped to routes should be in `src/app/pages` folder.
- Every component should follow the prescribed angular component layout as per official docs.
- The components must follow strict standalone pattern. A feature component should looks like follows:
  ```
  src/
  └── app/
      └── features/
          └── FeatureA/
              ├── FeatureAComponent/
              │   └── Child components
              └── FeatureAService
  ```
- Components must make use of signals if they use require input and output.
- Any component should NOT use `changedetectionref` to force angular to render the component.
- models must use only `Type` not `Interface`
- All the routes must be lazy loaded.
- Ensure to use barrel files to export and import across the project
- Ensure to use css variables for sharing values. Maintain them in `src/styles/_variables.scss`.
- The html should follow latest html5 standards and must adopt native browser based ui controls instead of generaring the boiler code from scratch.
- Follow official angular naming conventions
