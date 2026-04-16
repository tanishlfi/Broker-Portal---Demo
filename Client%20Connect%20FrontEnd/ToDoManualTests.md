# To-Do Manual Tests

## Recent Commits Overview

- **Commit 1:** Fixed client type not updating
- **Commit 2:** Updated validation on cell and phone number
- **Commit 3:** Update validation and error message
- **Commit 4:** Error message on policy or idnumber not found
- **Commit 5:** Add check to confirm scheme name matches between file and scheme selection
- **Commit 6:** Onboarding All Policies and My Policies exclude "Submitted", "Approved", "Complete", "Processing"
- **Commit 7:** Previous insurer details not saving and updating
- **Commit 8:** Cancellation of policy
- **Commit 9:** Premium display existing policies

## Manual Tests

### Fixed client type not updating

🐛

1. Open the application.
2. Add a policy or set existing policy to draft
3. Change member type from child to extendee
4. Verify successful change

```

```

### Updated validation on cell and phone number

🐛

1. Open the application.
2. Add a policy or set existing policy to draft
3. Enter invalid cell number (more than 10 digits)
4. Verify error message

```

```

### Update validation and error message

🐛

1. Open the application.
2. View policy with invalid data on cell number
3. Try to save
4. Verify error message
5. Update cell number to valid number
6. Save policy

```

```

### Error message on policy or idnumber not found

🐛

1. Open the application.
2. Under Administration, click on "Search Policy"
3. Search via ID number or policy number
4. Verify that "No policy found" message is displayed

```

```

### Previous insurer details not saving and updating

🐛

1. Open the application.
2. Add a policy or set existing policy to draft
3. Enter previous insurer details
4. Save policy
5. Verify that previous insurer details are saved

```

```

### Add check to confirm scheme name matches between file and scheme selection

⚡

1. Open the application.
2. Upload a file with a different scheme name under the "Company" column
3. Verify error message
4. Update scheme name to match the scheme selection
5. Verify successful upload

```

```

### Onboarding All Policies and My Policies exclude "Submitted", "Approved", "Complete", "Processing"

💄

1. Open the application.
2. Click on All Policies or My Policies under Onboarding
3. Verify that policies with status "Submitted", "Approved", "Complete", "Processing" are not displayed
4. Verify that the policies with these status are displayed when clicking on "Submitted", "Approved", "Complete", "Processing"

```

```

### Loading Cancellation of policy

✨

1. Open the application.
2. Click on search for a policy or edit an existing policy
3. Get a policy
4. Click on "Cancel Policy"
5. Capture details for cancellation
6. Submit cancellation
7. Get someone to approve or reject
8. If rejected update details and resubmit
9. Once approved verify that policy is cancelled

```

```

### Approving Cancellation of policy

✨

1. Open the application.
2. Check under "Allocated edit approvals"
3. Click on the relevant policy
4. Click on the request.
5. Click on approve or reject

```

```

### Premium display existing policies

💄

1. Open the application.
2. Click on search for a policy or edit an existing policy
3. Open a policy
4. Verify that premium is displayed correctly, if scheme inception is prior to 1 November 2023 then premium should be rounded to whole number and if scheme inception is after 1 November 2023 then premium should be rounded to 2 decimal places

```

```
