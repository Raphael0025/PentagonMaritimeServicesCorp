# TODO List

## Overview

This document outlines the tasks and improvements planned for the project. Each task is categorized by its status and priority.

## Tasks
- [] **Registration**
    - [] Trainee Tab, Include previous trainings of Crew
    - [] Analytics, finish it
    - [] include bd when creating batches / think about this one
    - [*] Buttons ( [*]Rollback | []Cancel and Move to BD | [*]Just Cancel )
        - [] functionalities for Move to BD
    - [*] Online Enrollment Form, Number type for birthdates
    - [*] modify status look in registrations tab
    - [*] remove permissions of same date in batch records
    - [*] update code for when status of trainee is greater than 3 (Enrolled) it is still editable in the registrations

- [] **Training**
    - [] Create button for training mode inside tracker for easy update
    - [] Certification Module
    - [] Re-think how to duplicate if a training is cancelled and used in a later batch
    - [] Analytics
    - [] Once Graduated Update Certification
    - [] Course Materials

- [] **Inventory**
    - [] Do this inventory

- [] **Misc.**
    - [] Include Leave Form Digital
    - [] Include Purchase Request Form Digital

### High Priority

- [] **Online Registration**: Features in Registration Form
    - **Details**:
        - [-] Training Calendar Schedule added 
        - [-] Fixed scroll issue on second page
        - [-] Revised the UI/UX of Online Enrollment Form
        - [ ] Conditional Process for In-house/STCW Courses
- [] **Training Tab**: Features in Training Tab
    - **Details**:
        - [-] Overview Tab
            - Implemented Email advise for both trainee and instructor
- [] **Registration Tab**: Features in Registration Tab
    - **Details**:
        - [-] Fixed Registration Series, reached 10000+ series
        - [-] Change Training Date
        - [-] Edit Course Fee
        - [-] Edit Course Name/Company Course Code
        - [-] Edit Account Type
        - [-] Implement Add New Training using current registration doc
        - [-] Rollback training doc and reg doc  to Pending
        - [-] Create Transfer from BD to Dated or vice versa
        - [] Implement Number of days in Edit training schedule
        - [] Refactor edit enrolled date
        - [-] implement new feature when rollbacked reg doesn't change its reg_no value

- [] **Pending Tab**: Features in Registration Tab
    - **Details**:
        - [-] Deleted TransferAccountType.tsx file
        - [-] Delete/Cancel Reg | Training
        - [-] Transform email from uppercase into lowercase
        - [-] Implement Add New Training using current registration doc
        - [-] Implement Add New Trainee or Old Trainee, Registration & Training Doc Modal for Email Advise trainings
        - [] Implement New Collection for Prev. companies of crew

- [] **Batch Records**: Enrollment Reports
    - **Details**:
        - [-] Create ER Report for (Standard | MDS)
        - [-] Create function for batch record
        - [-] Remove function 
        - [-] Update function 
        - [-] Print function
        **CAUTION**: It might use a lot of data reads that may lead to increase of cost.

- [] **Attachment**: Implement this feature
    - **Details**:
        - [] Payment Attachments - new page for sending online payments

- [-] **Start developing Accounting Dept.**: Begin developing Accounting Dept. for some reasons.
    - **Details**: This the beginning of the development of accounting department, this will serve as the connection of accounting and registration to generate acknowledgement receipts.

- [] **Feature Test**: Change Account Type Testing on Pending Tab
    - **Details**: 
        - [-] Detect if there are any registration of same date
        - [] Identify if the checker detects different registration but not the same date
        - [-] Transfer the selected training doc from the current registration to the different reg doc with a different account Type
        - [-] Try to revert back to the original reg
        - [-] Create New Reg doc if there is no existing or other reg doc detected
        - [*] Delete Reg, If training doc is the last one child of the reg and decided to change AT
            Note: If this happens, old reg cannot be rollback, it will only create a new One
            Note: Tell Reg Dept. to refrain from making mistakes before enrolling

### Medium Priority

- [] **Continuation of Certification**: Certification Development continuation
    - **Details**: When Urgent Tasks are completed, proceed in finishing the certification 

### Low Priority

- [] **Remodelling UI**: Considering remodelling system UI
    - **Details**: even so this part can be done after the whole system development. I am considering on using Primse React or Material UI

- [] **Marketing Department**: Ongoing development.
    - **Details**: Finish later the other departments.

- [] **Admin Department**: Ongoing development.
    - **Details**: Finish later the other departments.

- [] **Training Department**: Ongoing development.
    - **Details**: Finish later the other departments.

- [] **Registration Department**: Ongoing development.
    - **Details**: Finish later the other departments.

- [] **Accounting Department**: Ongoing development.
    - **Details**: Finish later the other departments.

- [] **Website**: Ongoing development.
    - **Details**: Finish later the other departments.


## Completed Tasks

- [*] **CLIENT COMPANY**: Continue making progress on CLIENT COMPANY in Marketing
    - **Details**: This will connect the its clients to registration upon company charges

- [*] **Company Charges Form**: ReDevelop company charge form 
    - **Details**: With this new form layout and functionality, provides a more controllable company charge data and storage

- [*] **Promo Form**: Redo Algorithm of Promo Form
    - **Details**: Redo algorithm of Promo Form, since current algorithm sticks only to one promo event, I've decided to implement adding more promo events to one course
    - and by events I mean Promo Dates that will expire once the promo date ends. 

- [*] **Migrate all Data in Courses**: Migrate Course Data if necessary then delete the old collection and use the new one
    - **Details**: Make sure that all necessary data has been migrated into new collections for the client-company

- [*] **Course Batches in Alphabetical Order**: ReDo algorithm for Batch Courses.
    - **Details**: By arranging the Course Batches in alphabetical arrangement will improve efficient browsing and search by limiting the display and adding search bar
    
- [*] **ReModel UI**: Remodelling UI of Course Management Forms
    - **Details**: EditCourseForm (if possible)

- [*] **End of line**: Placing a Nothing Follows message.
    - **Details**: By adding a **Nothing Follows** at the end of the enrollment report list, will the client be satisfied.

     
- [*] **Verify Registration**: Redo algorithm for registration Verification.
    - **Details**: By Remaking the algorithm for the verification of registration process will meet the expectations for this part of the operation.
    - So, if number of trainings is less than 3 then it must be automatically be considered as backdated. otherwise Dated.
    - and if both training were verified within the same day, their registration number will be the same.
    - However, if the Dept. verifies the training on the next day or week, then it will be a separate registration number generated for the training course.

- [*] **Registration Form**: UI must be Exact per say
    - **Details**: Make sure UI of these registrations forms be exact

- [*] **Admission Form & Acknowledgment Receipts**: Generating Admission Forms & Acknowledgment Receipts
    - **Details**: Create admission forms and acknowledgement receipts which is connected to accounting

- [] **Batch Generation of trainee capacity**: Limitting the capacity of trainees per batch.
    - **Details**: with this limitation of the capacity we are going to split the trainees into batches if the capacity exceeds 24 for a single training date.
    - we must program an algorithm that will seperate the batches and then generate a batch number for them.

- [*] **Training Schedules**: ReDo Training Schedule algorithms.
    - **Details**: Not doing a special schedule but rather a bulk schedule or create a form that will take specific trainees and change their schedules.
    - After trainee selection, and after creating a specialized schedule for them, it will automatically update the training schedule of that course.

- [*] **New Filter**: A new filter is requested by this department to improve search and data display.
    - **Details**: By adding this new filter to the Filters prompt for **incoming courses** will improve efficiency
    - however, it must be research on what kind of incoming courses filter shall be.

## System Errors/Issues
    - [] different enrolled date but same reg_no, fix this
    - [] reg number problem | created a new reg doc but it musn't supposed to happen


### How to commit beautifully 

git commit -m "Type of commit(specific parts of commit): Brief desccription on the commit

- items on which are being committed

Footer Title #[control number]"

## List of Commit Types & Footers

### Commit Types

- **feat** - Introduces a new feature to the codebase.
    git commit -m "feat: add user authentication"

- **fix** - Fixes a bug or an issue in the codebase.
    git commit -m "fix: resolve login button not working"

- **chore** - Updates that do not affect application behavior (e.g., dependency updates, build scripts, config changes).
    git commit -m "chore: update dependencies"

- **refactor** - Improves existing code without changing functionality.
    git commit -m "refactor: simplify registration form logic"

- **docs**- Changes related to documentation (README, inline comments, API docs).
    git commit -m "docs: update API usage in README"

- **style** - Changes that do not affect functionality but improve code formatting (e.g., linting, spacing, semicolons).
    git commit -m "style: fix indentation in utils.js"

- **test** - Adding, updating, or fixing tests.
    git commit -m "test: add unit test for login function"

- **perf** - Improves performance without changing features.
    git commit -m "perf: optimize database query execution time"

- **ci** - Updates related to CI/CD (e.g., GitHub Actions, Travis CI, Jenkins).
    git commit -m "ci: fix GitHub Actions deploy workflow"

- **build** - Changes affecting the build process (webpack, npm/yarn scripts, package.json, dependencies).
    git commit -m "build: update webpack config for production"

- **revert** - Reverts a previous commit.
    git commit -m "revert: undo feature X due to issues"

### Footer Types

- **BREAKING CHANGE**
- **Fixes**: Typically used when the commit addresses a bug.
- **Closes**: Used to indicate that the work described in the issue or PR is complete.
- **Resolves**: A general term indicating that the commit resolves the mentioned issue or PR.
- **Related**
- **References**
- **Co-authored-by**
- **Reviewed-by**
- **Signed-off-by**
- **See also**

### Change from png to jpg effective on May 1, 2025