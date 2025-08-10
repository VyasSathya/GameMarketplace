# Execute PRP Command

This command executes a Product Requirements Prompt (PRP) to implement features in GameMarketplace.

## Usage
```
/execute-prp PRPs/feature-name-prp.md
```

## Process

1. **Load PRP**: Read the complete PRP with all context
2. **Create Implementation Plan**: Break down into manageable tasks
3. **Execute with Validation**: Implement each component with testing
4. **Integration Testing**: Ensure all packages work together
5. **Final Validation**: Confirm all success criteria are met

## Command Implementation

```markdown
You are tasked with implementing a feature in GameMarketplace based on a comprehensive PRP.

## Input
Read the PRP from: $ARGUMENTS

## Implementation Process

### 1. LOAD CONTEXT
- Read the entire PRP thoroughly
- Understand all requirements and constraints
- Identify all package dependencies
- Note integration points with existing systems
- Understand Bitcoin payment requirements

### 2. CREATE TASK PLAN
Use the task management tools to create a detailed implementation plan:
- Break down into logical components
- Identify dependencies between tasks
- Set up validation checkpoints
- Plan integration testing
- Plan Bitcoin payment testing

### 3. IMPLEMENT COMPONENTS
For each component:
- Follow GameMarketplace patterns and conventions
- Implement with proper error handling
- Add comprehensive logging
- Include TypeScript types
- Follow the monorepo architecture patterns
- Ensure Bitcoin payment security

### 4. INTEGRATION TESTING
- Test package interactions
- Verify real-time features work
- Check database operations (Supabase)
- Validate API endpoints
- Test frontend-backend integration
- Test Bitcoin payment flows
- Test desktop app integration (Tauri)

### 5. VALIDATION
- Run all specified tests
- Check performance requirements
- Verify user experience goals
- Confirm Bitcoin payment security
- Test desktop app functionality
- Confirm all success criteria met

### 6. DOCUMENTATION
- Update relevant documentation
- Add code comments
- Document any new patterns
- Update API documentation if needed
- Document Bitcoin integration patterns

## Key Considerations for GameMarketplace
- Respect the monorepo package architecture
- Maintain Bitcoin payment security
- Ensure glassmorphism theme consistency
- Follow existing patterns for gaming marketplace UX
- Integrate properly with Tauri desktop app
- Maintain authentication system compatibility
- Preserve user experience standards
- Ensure cross-platform compatibility

Execute the implementation systematically, validating each step before proceeding to the next.
```
