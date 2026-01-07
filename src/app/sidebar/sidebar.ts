import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Command, Home, FileText, ClipboardList, House } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  imports: [LucideAngularModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  readonly commandIcon = Command;
  readonly fileTextIcon = FileText;
  readonly clipboardListIcon = ClipboardList;
  readonly houseIcon = House;
}
