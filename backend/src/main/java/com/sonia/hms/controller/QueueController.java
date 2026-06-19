package com.sonia.hms.controller;

import com.sonia.hms.dto.QueueStatusDto;
import com.sonia.hms.service.QueueService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/queue")
@Tag(name = "Queue")
public class QueueController {

    private final QueueService queueService;

    public QueueController(QueueService queueService) {
        this.queueService = queueService;
    }

    @GetMapping("/{doctorId}")
    public QueueStatusDto status(@PathVariable Long doctorId) {
        return queueService.getQueueStatus(doctorId);
    }

    @GetMapping("/board")
    public List<Map<String, Object>> board() {
        return queueService.getBoard();
    }

    @PostMapping("/{doctorId}/call-next")
    public QueueStatusDto callNext(@PathVariable Long doctorId) {
        return queueService.callNext(doctorId);
    }

    @PostMapping("/entries/{entryId}/skip")
    public QueueStatusDto skip(@PathVariable Long entryId) {
        return queueService.skip(entryId);
    }

    @PostMapping("/entries/{entryId}/complete")
    public QueueStatusDto complete(@PathVariable Long entryId) {
        return queueService.complete(entryId);
    }
}
