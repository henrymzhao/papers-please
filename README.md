# sfdx-papers-please

[![NPM](https://img.shields.io/npm/v/papers-please.svg?label=papers-please)](https://www.npmjs.com/package/sfdx-papers-please) [![Downloads/week](https://img.shields.io/npm/dw/papers-please.svg)](https://npmjs.org/package/sfdx-papers-please) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/salesforcecli/sfdx-papers-please/main/LICENSE.txt)

# Why

This plugin is built to solve the below problems:
1. I have a minor change across many profiles, but manually editing each profile is tiresome and prone to errors
2. I want to add permissions to a new custom Object across many files, but retrieving it then manually editing all the profiles is a pain
3. I have existing profiles that I want to keep maintained and committed in version control, but I don't want to manually manage them at a metadata level
   
These pain-points all revolve a central theme of "metadata".

Metadata is easy for machines to consume, but difficult for humans to understand and maintain.

CSVs on the other hand, are much simpler to manage with software like Excel.
# How

I want to solve the above pain-points by moving away from manually managing metadata files, and instead depend on a well-maintained CSV file as the central source of truth.

By keeping a central CSV file updated, we can achieve:
1. An easily auditable matrix of permission for period security reviews
2. A repeatable and consistent generation of permissions to deploy to all orgs
3. Easy addition of new permissions via a cell entry, instead of manual clicks in the Salesforce org
4. Turn permission setting and reviews into an easily accessible process instead of having it obfuscated away within Salesforce Profile pages

This  process is accomplished by `generating` or `converting` profile or permission set metadata files to and from CSV formats.
# What
## To Install from NPM

   ```bash
   npm i sfdx-papers-please
   ```

## Generate

`sf papers generate permset` 

or

`sf papers generate profile`

### Flags
`-c, --csv-file=<value>` - CSV of Profile or PermissionSet permissions.

`-p, --output-directory=<value>` - Output directory of generated profiles or permisision sets.

### Example
```bash
$ sf papers generate profile -c testInput.csv -p force-app/main/default/profiles
```
## Convert
`sf papers convert permset`

or

`sf papers convert profile`

### Flags
`-c, --profile-directory=<value>` - Path to Profile/Permission Sets to be converted to CSV.

`-p, --output-directory=<value>` - Output directory of new converted CSV files.

### Example
```bash
$ sf papers convert profile -c force-app/main/default/profiles -p some/path/
```

## List
This util command is used to retrieve all profiles from a target org, containing all metadata information instead of the barebones result from `sf force source retrieve -m Profile`.

### Flags
` -o, --target-org=<value>` - Org to list all profiles for.

`-p, --output-directory=<value>` - Location to store all files generated.

### Example
```bash
$ sf papers list -u ABC_UAT -p some/path/
```
# Using the CSV
Given Salesforce's metadata can get complex around Object accesses, I took some liberties to introduce some custom terminologies to make maintaining the CSV more agile.

## CRUD+MV
```xml
<objectPermissions>
    <allowCreate>true</allowCreate>
    <allowDelete>true</allowDelete>
    <allowEdit>true</allowEdit>
    <allowRead>true</allowRead>
    <modifyAllRecords>true</modifyAllRecords>
    <object>CustomObject</object>
    <viewAllRecords>true</viewAllRecords>
</objectPermissions>
```
The permission for this object is condensed down to: `CRUD+MV`

`C` - Allow Create

`R` - Allow Read

`U` - Allow Update

`D` - Allow Delete

`M` - Modify All

`V` - View All

The `+` symbol is purely to allow for easier human reading. Functionally `CRUDMV` and `CRUD+MV` is the same.

## RW
```xml
<fieldPermissions>
    <editable>true</editable>
    <field>Case.Subject</field>
    <readable>true</readable>
</fieldPermissions>
```
This field permission value is condensed to: `RW`

`R` - Readable
`W` - Writable

## `-`
Symbol used to indicate "do not populate anything".

E.g. When you are setting Opportunity permissions but certain profile's licenses don't support Opportunity.
## CSV Columns
### Type
Type of permission entry you're looking to add. E.g. `fieldPermissions`,  `objectPermissions`, `layoutAssignments`, etc.
### Primary Value
The value to assign to the above permission entry. 

For objects of full admin access, the primary value would be `CRUD+MV`. 

For a layout assignment, this would be your layout's name.

For a field permission, this would be your field's name.
### New Columns
Each new column represents a new Profile or Permission Set.

### Sample CSV for Profiles
Below is a sample CSV that can be used to as a base to generate Profiles
```csv
Type,Primary Value,Admin,Support Agent,Support Manager
fieldPermissions,Case.Subject,RW,RW,R
userPermissions,EditPublicFilters,TRUE,TRUE,FALSE
layoutAssignments,Account-Account Layout,Account.SomeRecordType,-,Account.SomeRecordType
fieldPermissions,Account.Name,RW,R,R
objectPermissions,Account,CRUD+MV,-,CRUD
recordTypeVisibilities,Account.SomeRecordType,Default,TRUE,TRUE
classAccesses,SomeApexClass,TRUE,FALSE,TRUE
```

You can also generate this file locally via:

```bash
sf papers sample -p sampleCSV/
```
# Use Cases
Some use cases that I am currently envisioning and building around:
1. A central CSV file that can be shared with the end user/group/client to make setting permissions a collaborative effort
2. Given the command can read+output to any directory designated, there's a lot of room to fit this into an automated pipeline build, so that profiles are auto-generated every time from the latest (versioned) CSV.
3. Developers can manually generate the permission files for review before committing to VCS, saving them the hassle of manual `sf force source retrieves` and copy pasting
4. An existing set of permission sets/profiles can be ported into CSV format for a security audit
5. All profiles within an org can be exported into VCS if setting up for the first time
6. All profiles/permission sets can be exported, then converted into CSV for security audits
