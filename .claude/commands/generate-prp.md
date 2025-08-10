# Generate PRP Command

This command generates a comprehensive Product Requirements Prompt (PRP) for GameMarketplace features.

## Usage
```
/generate-prp INITIAL.md
```

## Process

1. **Read Feature Request**: Parse the INITIAL.md file for requirements
2. **Research Codebase**: Use codebase-retrieval to understand existing patterns
3. **Analyze Architecture**: Consider GameMarketplace's Bitcoin-powered gaming marketplace architecture
4. **Create Implementation Plan**: Generate step-by-step implementation with validation
5. **Save PRP**: Store in PRPs/ folder with descriptive name

## Command Implementation

```markdown
You are tasked with generating a comprehensive Product Requirements Prompt (PRP) for GameMarketplace.

## Input
Read the feature request from: $ARGUMENTS

## Research Phase
1. Use codebase-retrieval to find:
   - Similar existing implementations
   - Relevant service patterns
   - Integration points with Bitcoin payment systems
   - Gaming marketplace patterns
   - Authentication and theme system patterns
   - Desktop app integration patterns (Tauri)
   - Real-time features and collaboration

2. Identify:
   - Required packages and their interactions
   - Database schema changes needed
   - Frontend components required
   - Backend API endpoints needed
   - Bitcoin payment integration requirements
   - Desktop app considerations
   - Testing requirements

## PRP Generation
Create a comprehensive PRP that includes:

### 1. CONTEXT & OVERVIEW
- Feature description and goals
- GameMarketplace integration points
- Package dependencies
- Bitcoin payment considerations

### 2. TECHNICAL REQUIREMENTS
- Frontend components needed (React + TypeScript + Vite)
- Backend services required (Node.js + Express)
- Database changes (Supabase)
- API endpoints
- Bitcoin/Lightning Network integration
- Desktop app requirements (Tauri)
- Real-time features

### 3. IMPLEMENTATION PLAN
- Step-by-step implementation
- Package integration order
- Bitcoin payment flow implementation
- Testing checkpoints
- Validation gates

### 4. VALIDATION CRITERIA
- Functional tests required
- Integration tests needed
- Bitcoin payment testing
- Performance benchmarks
- User experience validation
- Security validation

### 5. RISK MITIGATION
- Potential integration issues
- Bitcoin payment security considerations
- Performance considerations
- Desktop app compatibility
- Rollback procedures

Save the PRP as: PRPs/{feature-name}-prp.md

Ensure the PRP is comprehensive enough that any AI assistant can implement the feature successfully by following it exactly.
```
