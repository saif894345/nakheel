import { Pipe, PipeTransform } from '@angular/core';
import { agentNameAr } from '../utils/agent-display-name';

@Pipe({ name: 'agentName', standalone: false })
export class AgentNamePipe implements PipeTransform {
  transform(agent: string): string {
    return agentNameAr(agent);
  }
}
