The **Indirect Object References** best practice helps prevent vulnerabilities such as `Path Traversal` or `Open Redirect` because resources are accessed indirectly, through an intermediary identifier.

By limiting the set of objects to an authorized collection it also helps mitigate logical abuses and authorization bypasses.  

This best practice also has the following benefits:
- Prevents transmission of potentially sensitive data in URLs. Ex. instead of userEmail=`john.doe@company.com` use userEmailId=`52`.
- Input validation is easier to do. If the parameter is numeric or a GUID, validation is more straightforward than having to validate a  person name or file path.
