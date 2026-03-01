import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product, ProductFamily, FeatureDefinition } from '../models/license.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private mockProducts: Product[] = [
    { id: 'CAD-001', name: 'AutoCAD', description: 'Professional design software', familyId: 'AUTO', familyName: 'Autodesk' },
    { id: 'O365-001', name: 'Microsoft 365', description: 'Productivity suite', familyId: 'MS', familyName: 'Microsoft' },
    { id: 'IDEA-001', name: 'JetBrains IntelliJ', description: 'Java IDE', familyId: 'JB', familyName: 'JetBrains' },
    { id: 'SLACK-001', name: 'Slack', description: 'Team messaging platform', familyId: 'SL', familyName: 'Slack' },
    { id: 'FIGMA-001', name: 'Figma', description: 'Design and prototyping tool', familyId: 'FG', familyName: 'Figma' },
    { id: 'JIRA-001', name: 'Jira Cloud', description: 'Issue tracking and project management', familyId: 'ATL', familyName: 'Atlassian' },
    { id: 'GH-001', name: 'GitHub Enterprise', description: 'Version control and collaboration', familyId: 'GH', familyName: 'GitHub' },
    { id: 'STRIPE-001', name: 'Stripe Pro', description: 'Payment processing', familyId: 'ST', familyName: 'Stripe' },
    { id: 'ZOOM-001', name: 'Zoom Pro', description: 'Video conferencing', familyId: 'ZM', familyName: 'Zoom' },
    { id: 'AWS-001', name: 'AWS Enterprise', description: 'Cloud infrastructure', familyId: 'AM', familyName: 'Amazon' },
    { id: 'NOTIO-001', name: 'Notion Business', description: 'All-in-one workspace', familyId: 'NO', familyName: 'Notion' },
    { id: 'ASANA-001', name: 'Asana Premium', description: 'Work management platform', familyId: 'AS', familyName: 'Asana' }
  ];

  private mockProductFamilies: ProductFamily[] = [
    { id: 'AUTO', name: 'Autodesk', description: 'Autodesk design and engineering products' },
    { id: 'MS', name: 'Microsoft', description: 'Microsoft productivity and cloud services' },
    { id: 'JB', name: 'JetBrains', description: 'JetBrains development tools' },
    { id: 'SL', name: 'Slack', description: 'Slack communication platform' },
    { id: 'FG', name: 'Figma', description: 'Figma design tools' },
    { id: 'ATL', name: 'Atlassian', description: 'Atlassian collaboration software' },
    { id: 'GH', name: 'GitHub', description: 'GitHub version control' },
    { id: 'ST', name: 'Stripe', description: 'Stripe payment services' },
    { id: 'ZM', name: 'Zoom', description: 'Zoom communication services' },
    { id: 'AM', name: 'Amazon', description: 'Amazon cloud services' },
    { id: 'NO', name: 'Notion', description: 'Notion workspace' },
    { id: 'AS', name: 'Asana', description: 'Asana work management' }
  ];

  private mockFeatures: { [productId: string]: FeatureDefinition[] } = {
    'CAD-001': [
      { id: 'F001', name: 'Max Users', dataType: 'int', description: 'Maximum concurrent users' },
      { id: 'F002', name: '2D Drawing', dataType: 'bool', description: '2D drawing capabilities' },
      { id: 'F003', name: '3D Modeling', dataType: 'bool', description: '3D modeling features' }
    ],
    'O365-001': [
      { id: 'F004', name: 'Max Devices', dataType: 'int', description: 'Devices per user' },
      { id: 'F005', name: 'Storage GB', dataType: 'int', description: 'Total storage in GB' },
      { id: 'F006', name: 'Teams', dataType: 'bool', description: 'Microsoft Teams included' }
    ],
    'IDEA-001': [
      { id: 'F007', name: 'Max Projects', dataType: 'int', description: 'Open projects limit' },
      { id: 'F008', name: 'Debugging', dataType: 'bool', description: 'Advanced debugging' },
      { id: 'F009', name: 'Plugins', dataType: 'bool', description: 'Plugin support' }
    ],
    'SLACK-001': [
      { id: 'F010', name: 'Max Members', dataType: 'int', description: 'Team member limit' },
      { id: 'F011', name: 'Message History', dataType: 'int', description: 'Searchable message history (days)' },
      { id: 'F012', name: 'Workflows', dataType: 'bool', description: 'Advanced workflows' }
    ],
    'FIGMA-001': [
      { id: 'F013', name: 'Max Projects', dataType: 'int', description: 'Project limit' },
      { id: 'F014', name: 'Versioning', dataType: 'bool', description: 'Version history' },
      { id: 'F015', name: 'Prototyping', dataType: 'bool', description: 'Interactive prototyping' }
    ],
    'JIRA-001': [
      { id: 'F016', name: 'Max Users', dataType: 'int', description: 'Maximum users' },
      { id: 'F017', name: 'Custom Fields', dataType: 'bool', description: 'Custom field support' },
      { id: 'F018', name: 'Automation', dataType: 'bool', description: 'Rule automation' }
    ],
    'GH-001': [
      { id: 'F019', name: 'Max Repos', dataType: 'int', description: 'Repository limit' },
      { id: 'F020', name: 'Private', dataType: 'bool', description: 'Private repositories' },
      { id: 'F021', name: 'CI/CD', dataType: 'bool', description: 'GitHub Actions included' }
    ],
    'STRIPE-001': [
      { id: 'F022', name: 'Transaction Limit', dataType: 'int', description: 'Monthly transaction limit' },
      { id: 'F023', name: 'Advanced Analytics', dataType: 'bool', description: 'Advanced reporting' },
      { id: 'F024', name: 'API Access', dataType: 'bool', description: 'Full API access' }
    ],
    'ZOOM-001': [
      { id: 'F025', name: 'Max Participants', dataType: 'int', description: 'Meeting participant limit' },
      { id: 'F026', name: 'Recording', dataType: 'bool', description: 'Cloud recording' },
      { id: 'F027', name: 'Breakout Rooms', dataType: 'bool', description: 'Breakout room support' }
    ],
    'AWS-001': [
      { id: 'F028', name: 'Compute Units', dataType: 'int', description: 'Monthly compute units' },
      { id: 'F029', name: 'Support', dataType: 'string', description: 'Support tier' },
      { id: 'F030', name: 'Premium Support', dataType: 'bool', description: 'Premium support included' }
    ],
    'NOTIO-001': [
      { id: 'F031', name: 'Max Pages', dataType: 'int', description: 'Page limit' },
      { id: 'F032', name: 'Collaboration', dataType: 'bool', description: 'Team collaboration' },
      { id: 'F033', name: 'Templates', dataType: 'bool', description: 'Template library access' }
    ],
    'ASANA-001': [
      { id: 'F034', name: 'Max Teams', dataType: 'int', description: 'Team limit' },
      { id: 'F035', name: 'Timeline View', dataType: 'bool', description: 'Gantt timeline' },
      { id: 'F036', name: 'Advanced Reports', dataType: 'bool', description: 'Custom reporting' }
    ]
  };

  constructor() {}

  /**
   * Get all available products
   */
  getProducts(): Observable<Product[]> {
    return of(this.mockProducts);
  }

  /**
   * Get all product families
   */
  getProductFamilies(): Observable<ProductFamily[]> {
    return of(this.mockProductFamilies);
  }

  /**
   * Get features available for a specific product
   */
  getFeaturesForProduct(productId: string): Observable<FeatureDefinition[]> {
    const features = this.mockFeatures[productId] || [];
    return of(features);
  }

  /**
   * Get a product by ID
   */
  getProductById(productId: string): Observable<Product | undefined> {
    const product = this.mockProducts.find(p => p.id === productId);
    return of(product);
  }

  /**
   * Get a product family by ID
   */
  getProductFamilyById(familyId: string): Observable<ProductFamily | undefined> {
    const family = this.mockProductFamilies.find(f => f.id === familyId);
    return of(family);
  }
}
