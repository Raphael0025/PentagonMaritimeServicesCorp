# TODO List

## Overview

This document outlines the tasks and improvements planned for the project. Each task is categorized by its status and priority.

## Tasks

### High Priority

- [-] **Start developing Accounting Dept.**: Begin developing Accounting Dept. for some reasons.
    - **Details**: This the beginning of the development of accounting department, this will serve as the connection of accounting and registration to generate acknowledgement receipts.


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
    
## Notes
This note is for testing 2.

### How to commit beautifully 

git commit -m "Type of commit(specific parts of commit): Brief desccription on the commit

- items on which are being committed

Footer Title #[control number]"

## List of Commit Types & Footers

### Commit Types

- **feat**
- **fix**
- **chore**
- **refactor**
- **docs**
- **style**
- **test**
- **perf**
- **ci**
- **build**
- **revert**

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